import { errors, logger } from '@omniflex/core';
import { Request, Response, NextFunction, TLocals } from '../types';

type TBaseLocals = TLocals;

export class BaseExpressController<TLocals extends TBaseLocals = TBaseLocals> {
  protected req: Request;
  protected res: Response;
  protected next: NextFunction;
  protected locals: TLocals;

  public user?: TLocals['user'];

  constructor(req, res, next) {
    this.req = req;
    this.res = res;
    this.next = next;

    this.user = this.res.locals.user;
    this.locals = this.res.locals as TLocals;
  }

  tryActionWithBody<T>(
    action: (body: T) => Promise<any> | any,
    options: Parameters<BaseExpressController['tryAction']>[1] & {
      getBody?: () => T;
    } = {}
  ) {
    return this.tryAction(() => {
      const body = options.getBody ?
        options.getBody() : this.req.body;

      return action(body);
    }, options);
  }

  async tryAction(
    action: () => Promise<any> | any,
    { streamErrorToConsole = false } = {}
  ) {
    try {
      return await action();
    } catch (error) {
      streamErrorToConsole && console.error(error);

      logger.error(error instanceof Error ?
        { error } : { data: error }
      );

      return this.next(error);
    }
  }

  respondOne(data: any) {
    return this.res.json({ data });
  }

  respondRequired(key: string) {
    return this.respondOne(this.locals.required[key]);
  }

  respondMany(data: Array<any> = [], total?: number) {
    return this.res.json({
      data,
      total: total || data.length,
    });
  }

  protected throwNotFound(type?: string) {
    throw errors.notFound(type);
  }

  protected throwForbidden() {
    throw errors.forbidden();
  }

  protected get remoteAddress() {
    return `${this.req.headers.forwarded || this.req.ip}`.trim() ||
      undefined;
  }

  protected get pathId() {
    return +this.req.params.id;
  }

  protected get pageSize() {
    const rawPageSize = this.req.query.pageSize;
    const pageSize = rawPageSize ? +rawPageSize : undefined;

    if (pageSize && !isNaN(pageSize)) {
      return pageSize;
    }

    return 10;
  }

  protected get page() {
    const rawPage = this.req.query.page;
    const page = rawPage ? +rawPage : undefined;

    if (page && !isNaN(page)) {
      return page;
    }

    return 1;
  }
}
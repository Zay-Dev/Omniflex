import { errors, logger } from '@omniflex/core';
import { Request, Response, NextFunction, TLocals } from '../types';

type TBaseLocals = TLocals;

export class BaseController<TLocals extends TBaseLocals = TBaseLocals> {
  protected locals: TLocals;
  public user?: TLocals['user'];

  constructor(
    protected req: Request,
    protected res: Response,
    protected next: NextFunction
  ) {
    this.user = this.res.locals.user;
    this.locals = this.res.locals as TLocals;
  }

  async tryActionWithBody<T>(
    action: (body: T) => Promise<any> | any,
    options: Parameters<BaseController['tryAction']>[1] & {
      getBody?: () => T;
    } = {}
  ) {
    return await this.tryAction(() => {
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

  protected respondOne(data: any) {
    return this.res.json({ data });
  }

  protected respondMany(data: Array<any> = [], total?: number) {
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
}
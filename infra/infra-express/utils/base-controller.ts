import { errors, logger, Utils } from '@omniflex/core';
import { Request, Response, NextFunction } from 'express';

import * as ExpressUtils from './express';
import { ensureLocals } from './locals-initializer';
import { TInfraExpressLocals } from '@omniflex/infra-express/internal-types';

export class BaseExpressController<TLocals extends TInfraExpressLocals = TInfraExpressLocals> {
  protected locals: TLocals;
  protected user?: TLocals['user'];

  constructor(
    protected req: Request,
    protected res: Response,
    protected next: NextFunction
  ) {
    this.locals = ensureLocals(this.res.locals, 'default') as TLocals;
    this.user = this.locals.user;
  }

  protected tryActionWithBody<T>(
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

  protected async tryAction(
    action: () => Promise<any> | any,
    { streamErrorToConsole = false } = {}
  ) {
    return Utils.tryAction(action, {
      logger,
      next: this.next,
      streamErrorToConsole,
    });
  }

  protected respondOne(data: any) {
    return ExpressUtils.respondOne(this.res, data);
  }

  protected respondRequired(key: string) {
    return ExpressUtils.respondRequired(this.res, this.locals, key);
  }

  protected respondMany(data: Array<any> = [], total?: number) {
    return ExpressUtils.respondMany(this.res, data, total);
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
    const value = this.req.params.id;
    const int = +value;

    return isNaN(int) ? value : int;
  }

  protected get pageSize() {
    const rawPageSize = this.req.query.pageSize;
    const pageSize = rawPageSize ? +rawPageSize : undefined;

    if (pageSize && !isNaN(pageSize) && pageSize > 0) {
      return pageSize;
    }

    return 10;
  }

  protected get page() {
    const rawPage = this.req.query.page;
    const page = rawPage ? +rawPage : undefined;

    if (page && !isNaN(page) && page > 0) {
      return page;
    }

    return 1;
  }
}
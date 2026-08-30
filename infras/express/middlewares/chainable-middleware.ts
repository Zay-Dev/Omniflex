import type { TMiddleware } from '../types';
import type { THydratedParams } from './create-handler';

import { hydrateParams } from './create-handler';

type TInternalHandler =
  (express: THydratedParams, input: any, context: any) => any | Promise<any>;

type THandler<TOutput, TInput = never, TContext = never> =
  [TInput] extends [never] ?
  (express: THydratedParams, context: TContext) => TOutput | Promise<TOutput> :
  (express: THydratedParams, input: TInput, context: TContext) => TOutput | Promise<TOutput>;

export type { Chainable };

type TInternalContext<T, TOutput> =
  [T] extends [never] ? Awaited<TOutput> : (
    TOutput extends Record<string, any> | Promise<Record<string, any>> ?
    Omit<T, keyof Awaited<TOutput>> & Awaited<TOutput> : T
  );

class Chainable<TOutput = void, TInput = void, TContext = undefined> {
  private readonly OUTPUT_TYPE: Awaited<TOutput> = null!;

  private readonly _handlers = new Array<TInternalHandler>();

  constructor(
    handler: THandler<TOutput, TInput, TContext>,
    previousHandlers: typeof Chainable.prototype._handlers = [],
  ) {
    this._handlers.push(...previousHandlers, handler);
  }

  public next<TOutput>(
    handler: THandler<
      TOutput,
      typeof this.OUTPUT_TYPE,
      TInternalContext<TContext, typeof this.OUTPUT_TYPE>
    >,
  ) {
    return new Chainable<
      TOutput,
      typeof this.OUTPUT_TYPE,
      TInternalContext<TContext, typeof this.OUTPUT_TYPE>
    >(
      handler,
      this._handlers,
    );
  }

  public validate = this.next;

  public toMiddleware(): TMiddleware<void> {
    return (req, res, next) => {
      const express = hydrateParams({ req, res, next });

      express.try(async () => {
        switch (this._handlers.length) {
          case 0:
            return express.next(errors.custom('No handler provided'));

          case 1:
            return await this._handlers[0](express, undefined, undefined);
        }

        await this._processHandlers(express);
      });
    };
  }

  private async _processHandlers(express: THydratedParams) {
    let doc: any;
    let context = {} as Record<string, any>;

    for (const handler of this._handlers) {
      doc = await handler(express, doc, context);
      context = { ...context, ...doc };
    }
  };
}

export const next = <TOutput,>(
  handler: (Express: THydratedParams) =>
    [TOutput] extends [never] ? any : TOutput | Promise<TOutput>,
) => {
  const chainable = new Chainable(handler);

  return chainable;
};

export const validate = next;
import type { TMiddleware } from '../types';
import type { THydratedParams } from './create-handler';

import { hydrateParams } from './create-handler';

type TInternalHandler =
  (express: THydratedParams, input?: any) => any | Promise<any>;

type THandler<TOutput, TInput = never> =
  [TInput] extends [never] ?
  (express: THydratedParams) => TOutput | Promise<TOutput> :
  (express: THydratedParams, input: TInput) => TOutput | Promise<TOutput>;

export type { Chainable };

class Chainable<TOutput = void, TInput = void> {
  private readonly OUTPUT_TYPE: Awaited<TOutput> = null!;

  private readonly _handlers = new Array<TInternalHandler>();

  constructor(
    handler: THandler<TOutput, TInput>,
    previousHandlers: typeof Chainable.prototype._handlers = [],
  ) {
    this._handlers.push(...previousHandlers, handler);
  }

  public next<TOutput>(
    handler: THandler<TOutput, typeof this.OUTPUT_TYPE>,
  ) {
    return new Chainable<TOutput, typeof this.OUTPUT_TYPE>(
      handler,
      this._handlers,
    );
  }

  public validate = this.next;

  public toMiddleware(): TMiddleware<void> {
    return (req, res, next) => {
      const express = hydrateParams({ req, res, next });

      switch (this._handlers.length) {
        case 0:
          return express.next(errors.custom('No handler provided'));

        case 1:
          return this._handlers[0](express);
      }

      this._processHandlers(express);
    };
  }

  private async _processHandlers(express: THydratedParams) {
    let doc: any;

    for (const handler of this._handlers) {
      doc = await handler(express, doc);
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
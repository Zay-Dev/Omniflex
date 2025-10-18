import type { Redis, Cluster } from 'ioredis';

type TRedisStatus = Redis['status'];

type TRedisEvent = TRedisStatus
  | 'message'
  | 'messageBuffer'
  | 'pmessage'
  | 'pmessageBuffer'
  | 'error';

interface IEventsAdapter {
  on(event: "message", cb: (channel: string, message: string) => void): this;
  once(event: "message", cb: (channel: string, message: string) => void): this;
  on(event: "messageBuffer", cb: (channel: Buffer, message: Buffer) => void): this;
  once(event: "messageBuffer", cb: (channel: Buffer, message: Buffer) => void): this;

  on(event: "pmessage", cb: (pattern: string, channel: string, message: string) => void): this;
  once(event: "pmessage", cb: (pattern: string, channel: string, message: string) => void): this;
  on(event: "pmessageBuffer", cb: (pattern: string, channel: Buffer, message: Buffer) => void): this;
  once(event: "pmessageBuffer", cb: (pattern: string, channel: Buffer, message: Buffer) => void): this;

  on(event: "error", cb: (error: Error) => void): this;
  once(event: "error", cb: (error: Error) => void): this;

  on(event: TRedisStatus, cb: () => void): this;
  once(event: TRedisStatus, cb: () => void): this;

  removeListener(event: TRedisEvent, cb: (...args: any[]) => void): this;
}

class EventsAdapter implements IEventsAdapter {
  constructor(private _redis: Redis | Cluster) { }

  on(event: TRedisEvent, cb: (...args: any[]) => void): this {
    (this._redis as any as Redis).on(event, cb);
    return this;
  }

  once(event: TRedisEvent, cb: (...args: any[]) => void) {
    (this._redis as any as Redis).once(event, cb);
    return this;
  }

  removeListener(event: TRedisEvent, cb: (...args: any[]) => void) {
    (this._redis as any as Redis).removeListener(event, cb);
    return this;
  }
}

export const getEventsAdapter = (redis: Redis | Cluster) => {
  return new EventsAdapter(redis) as IEventsAdapter;
};
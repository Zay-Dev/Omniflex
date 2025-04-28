import './errors';
import './logger';

globalThis.Events = {} as any;

declare global {
  namespace Events {}
}
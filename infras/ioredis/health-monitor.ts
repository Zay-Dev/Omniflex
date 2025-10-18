import type { Redis, Cluster } from 'ioredis';

import { getEventsAdapter } from './events-adapter';

export const monitorHealth = (
  redis: Redis | Cluster,
  {
    timeoutSeconds = 30,
  }: {
    timeoutSeconds?: number;
  } = {},
) => {
  const events = getEventsAdapter(redis);

  const onClose = () => {
    if (!!timeout) return;

    logger.warn('Connection lost, waiting for reconnection...', { tags: 'Redis' });

    timeout = setTimeout(() => {
      logger.error('Connection lost, reconnection failed', { tags: 'Redis' });
      process.exit(1);
    }, timeoutSeconds * 1000);
  };

  let timeout: ReturnType<typeof setTimeout>;
  
  events.on('close', onClose);
  events.on('connect', () => {
    clearTimeout(timeout);
    logger.info('Connection restored', { tags: 'Redis' });
  });
};
import type { RedisOptions, Cluster } from 'ioredis';

import '@omni-infra/core';

import Redis from 'ioredis';

export type TRedisClient = Awaited<ReturnType<typeof connect>>;

type TRedisConfig = RedisOptions & {
  cluster?: {
    enableOfflineQueue?: boolean;
    nodes: Array<{ host: string; port: number; }>;
  };
};

const _validateConfig = (config: TRedisConfig) => {
  if (!config.cluster) return true;

  return Array.isArray(config.cluster.nodes) &&
    config.cluster.nodes.length > 0;
};

export const connect = async (config: TRedisConfig) => {
  try {
    if (!_validateConfig(config)) {
      throw new Error('Invalid Redis configuration');
    }

    const redis = await new Promise<Redis | Cluster>(
      (resolve, reject) => {
        const callback = (_redis: Cluster | Redis) => {
          const redis: Redis = _redis as any as Redis;

          redis
            .once('error', reject)
            .once('connect', () => {
              redis.removeListener('error', reject);
              resolve(_redis);
            });
        };

        if (!config.cluster) {
          callback(new Redis(config));
          return;
        }

        const { cluster, ...redisOptions } = config;
        const options = {
          enableOfflineQueue: cluster.enableOfflineQueue ?? true,
          ...redisOptions,
        };

        callback(new Redis.Cluster(cluster.nodes, options));
      }
    );

    await redis.ping();
    logger.info('Redis connected', { tags: 'Redis.ping'});

    return redis;
  } catch (error: any) {
    logger.error({ error, tags: 'Redis.connect' });
    process.exit(1);
  }
};

export const disconnect = async (...servers: (Redis | Cluster)[]) => {
  if (servers.length === 0) {
    return;
  }

  await Promise.all(servers.map(server => server.disconnect()));
};

export const healthCheck = async (redis: Redis | Cluster) => {
  const timestamp = Date.now();

  try {
    await redis.ping();

    return {
      timestamp,
      connected: true,
    };
  } catch (error) {
    return {
      timestamp,
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
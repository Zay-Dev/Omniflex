import { createHandler } from './create-handler';
import { TUser } from '../types';

export const ACCESS_TOKEN_TYPE = 'access-token';

type TOptions<TUser> = {
  optional?: true;
  tokenType?: string;
  verify: (token: string) => Promise<TUser>;
  validateRole?: (user: TUser) => boolean | Promise<boolean>;
  validateToken?: (user: TUser, token: string) => boolean | Promise<boolean>;
};

export const defaultBearerToken = <T extends TUser>({
  validateRole,
  validateToken,
  tokenType = ACCESS_TOKEN_TYPE,
  ...options
}: TOptions<T>) => {
  return createHandler(async (express) => {
    try {
      const token = extractToken(express.req.headers.authorization);

      if (!token) {
        return options.optional ?
          express.next() :
          express.next(errors.unauthorized());
      }

      const user = await options.verify(token);
      if (user.__tokenType != tokenType) {
        return express.next(errors.unauthorized());
      }

      if (validateToken) {
        if (!await validateToken(user, token)) {
          return express.next(errors.unauthorized());
        }
      }

      if (validateRole) {
        if (!await validateRole(user)) {
          return express.next(errors.forbidden());
        }
      }

      (express.res.locals as any).user = user;
      return express.next();
    } catch (error: any) {
      logger.error('Auth', { error });
      express.next(errors.unauthorized());
    }
  });
};

const extractToken = (token: string | null | undefined) => {
  return (token || '').substring(7);
};
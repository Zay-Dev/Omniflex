import { createHandler } from './create-handler';
import { TUser, TExpressParams, } from '../types';

export const ACCESS_TOKEN_TYPE = "access-token";

type TOptions<TUser> = {
  optional?: true;
  tokenType?: string;
  verify: (token: string) => Promise<TUser>;
  validateRole?: (user: TUser) => boolean | Promise<boolean>;
  validateToken?: (token: string) => boolean | Promise<boolean>;
};

export const defaultBearerToken = <T extends TUser>({
  validateRole,
  validateToken,
  tokenType = ACCESS_TOKEN_TYPE,
  ...options
}: TOptions<T>) =>
  createHandler(async (express) => {
    try {
      const token = extractToken(express.req.headers.authorization);

      if (!token) {
        return options.optional ?
          express.next() :
          express.next(errors.unauthorized());
      }

      const user = await options.verify(token);
      if (user.__tokenType != ACCESS_TOKEN_TYPE) {
        return express.next(errors.unauthorized());
      }

      const validToken = validateToken ? await validateToken(token) : true;
      if (!validToken) {
        return express.next(errors.unauthorized());
      }

      const validUser = validateRole ? await validateRole(user) : true;
      if (!validUser) {
        return express.next(errors.forbidden());
      }

      express.res.locals.user = user;
      return express.next();
    } catch (error: any) {
      logger.error("Auth", { error });
      express.next(errors.unauthorized());
    }
  });

export const useUser = <T extends TUser>({ res }: TExpressParams) => {
  return res.locals.user as T;
};

const extractToken = (token: string | null | undefined) => {
  return (token || "").substring(7);
};
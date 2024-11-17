import {
  TAuthenticatedUser,
  IAuthenticationProvider,
} from '../types';

export const getAuthMiddleware = <TUser = TAuthenticatedUser>(
  provider: IAuthenticationProvider,
  {
    optional,
    bindUser,
    validateUser,
  }: {
    optional?: boolean,
    bindUser?: (user: TUser) => void,
    validateUser?: (user: TUser) => boolean,
  } = {},
) => {
  return async (req, res, next) => {
    const bearerToken = req?.headers?.authorization?.split('Bearer ')[1];
    const canAuth = provider.canAuth(bearerToken || '');

    if (!canAuth) {
      return optional ? next() :
        next(provider.get401Error());
    }

    try {
      const result = await provider.authenticate<TUser>(bearerToken);
      const isValidUser = result.user && (
        !validateUser || validateUser(result.user)
      );

      if (!isValidUser) {
        return next(provider.get401Error());
      }

      if (bindUser) {
        bindUser(result.user);
      } else {
        res.locals.user = result.user;
      }
    } catch (error) {
      next(error);
    }

    return next();
  };
};
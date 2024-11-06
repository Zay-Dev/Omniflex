import {
  TAuthenticatedUser,
  IAuthenticationProvider,
} from '../types';

export const getAuthMiddleware = <TUser = TAuthenticatedUser>(
  provider: IAuthenticationProvider,
  {
    bindUser,
    validateUser,
  }: {
    bindUser?: (user: TUser) => void,
    validateUser?: (user: TUser) => boolean,
  },
) => {
  return async (req, res, next) => {
    try {
      const result = await provider.authenticate<TUser>(req);
      const isValidUser = result.user && (
        !validateUser || validateUser(result.user)
      );

      if (!isValidUser) {
        return next(provider.get401Error('INVALID_USER'));
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
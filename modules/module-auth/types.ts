export type TAuthenticatedUser = {
  [key: string]: any;
};

export type TAuthenticationResult<TUser = TAuthenticatedUser> = {
  user: TUser;
};

export interface IAuthenticationProvider<TInput = any> {
  get401Error(errorCode?: string): void;

  authenticate<TUser = TAuthenticatedUser>(data: TInput): Promise<TAuthenticationResult<TUser>>;
}

//export interface ICookieProvider extends IAuthenticationProvider {
//  createSession(user: TAuthenticatedUser): Promise<string>;
//  validateSession(sessionId: string): Promise<TAuthenticatedUser>;
//}
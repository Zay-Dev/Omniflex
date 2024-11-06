import { Algorithm } from 'jsonwebtoken';
import { TBaseConfig } from '@omniflex/core/types/config';

import { IAuthenticationProvider } from '../../types';

export interface IJwtProvider extends IAuthenticationProvider<string> {
  signToken(payload: any): Promise<string>;
  verifyToken(token: string): Promise<any>;
}

export type TJwtConfig = {
  publicKeyPath: string;
  privateKeyPath: string;

  issuer?: string;
  algorithm: Algorithm;
  expiresIn: string | number;
};

export type TAuthConfig = TBaseConfig & {
  jwt: TJwtConfig;
};

export type TJwtPayload = {
  sub: string;  // User ID
  iat?: number; // Issued at
  exp?: number; // Expiration
  iss?: string; // Issuer
  [key: string]: any;
};
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';

import { errors } from '@omniflex/core';
import { configAs } from '@omniflex/core/config';

import {
  TJwtConfig,
  TJwtPayload,
  TAuthConfig,
  IJwtProvider,
} from './types';

const baseConfig = configAs<TAuthConfig>();
const loadKey = (path: string) => fs.readFile(path, 'utf8');

export class JwtProvider implements IJwtProvider {
  private _publicKey?: string;
  private _privateKey?: string;

  constructor(private readonly _config: TJwtConfig) { }

  get401Error(errorCode?: string) {
    return errors.unauthorized({
      errorCode,
      error: 'JWT_PROVIDER'
    });
  }

  async signToken(
    payload: Omit<TJwtPayload, 'iat' | 'exp'>
  ): Promise<string> {
    await this._loadKeys();

    return jwt.sign(payload, this._privateKey!, {
      algorithm: this._config.algorithm,
      expiresIn: this._config.expiresIn,
      issuer: this._config.issuer || undefined,
    });
  }

  async verifyToken(token: string): Promise<TJwtPayload> {
    await this._loadKeys();

    try {
      return jwt.verify(
        token,
        this._publicKey!,
        {
          issuer: this._config.issuer,
          algorithms: [this._config.algorithm],
        },
      ) as TJwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw this.get401Error("TOKEN_EXPIRED");
      }

      throw this.get401Error("INVALID_TOKEN");
    }
  }

  async authenticate(token: string) {
    if (!token) {
      throw errors.unauthorized({ error: 'NO_TOKEN' });
    }

    const payload = await this.verifyToken(
      this.sanitizeToken(token)
    );

    return { user: { ...payload } as any };
  }

  private sanitizeToken(token: string) {
    return token.replace(/^Bearer\s/, '');
  }

  private async _loadKeys() {
    if (!this._publicKey) {
      this._publicKey = await loadKey(this._config.publicKeyPath);
    }

    if (!this._privateKey) {
      this._privateKey = await loadKey(this._config.privateKeyPath);
    }
  }
}

export const create = (config?: Partial<TJwtConfig>) => {
  return new JwtProvider({
    ...baseConfig.jwt,
    ...(config || {}),
  });
};
import bcrypt from 'bcrypt';
import { IHashProvider } from '@omniflex/core/types/hash';

const SALT_ROUNDS = 12;

export class BcryptHashProvider implements IHashProvider {
  constructor(private readonly saltRounds: number = SALT_ROUNDS) { }

  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.saltRounds);
  }

  async verify(value: string, hashedValue: string): Promise<boolean> {
    return bcrypt.compare(value, hashedValue);
  }
}

export const create = () => new BcryptHashProvider();
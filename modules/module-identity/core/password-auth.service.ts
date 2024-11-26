import { v4 as uuid } from 'uuid';
import { errors, providers } from '@omniflex/core';

import { TUser } from './types';
import { resolve } from './containers';

const hashProvider = providers.hash;
const repositories = resolve<TUser>();
const { users, profiles, passwords, loginAttempts } = repositories;

type TRegisterProfile = {
  email?: string;
  mobileNumber?: string;

  firstName?: string;
  lastName?: string;
} & Record<string, any>;

type TRecordLoginAttemptProps = {
  userId?: string;
  identifier: string;
  remark?: any;
  success?: boolean;
  remoteAddress?: string;
};

const hashPassword = async (password: string) => {
  const salt = uuid();
  const hashedPassword = await hashProvider.hash(`${password}-${salt}`);

  return { salt, hashedPassword };
};

const verifyPassword = async ({ password, hashedPassword, salt }) => {
  return hashProvider.verify(`${password}-${salt}`, hashedPassword);
};

export class PasswordAuthService {
  constructor(readonly appType: string) { }

  async registerWithUsername(
    info: {
      username: string;
      password: string;
    },
    {
      email,
      firstName,
      lastName,
      mobileNumber,
      ...profile
    }: TRegisterProfile,
  ) {
    const { username, password } = info;

    const user = await users.create({ identifier: username });
    const { salt, hashedPassword } = await hashPassword(password);

    await passwords.create({
      salt,
      username,
      hashedPassword,
      userId: user.id,
    });

    await profiles.create({
      profile,
      email,
      firstName,
      lastName,
      mobileNumber,

      userId: user.id,
    });

    return user;
  }

  async loginByUsername(values: {
    username: string;
    password: string;
    remoteAddress?: string;
  }) {
    const recordFail = (data: Partial<TRecordLoginAttemptProps> = {}) => {
      return this._recordLoginAttempt({
        ...data,
        identifier: values.username,
        remoteAddress: values.remoteAddress,
        success: data.success || false,
      });
    };

    const password = await passwords.findByUsername(values.username);
    if (!password) {
      await recordFail();
      throw errors.unauthorized();
    }

    const isValidPassword = await verifyPassword({
      ...values,
      salt: password.salt,
      hashedPassword: password.hashedPassword,
    });

    if (!isValidPassword) {
      await recordFail({ userId: password.userId });
      throw errors.unauthorized();
    }

    const user = await users.findOne({ id: `${password.userId}` });
    if (!user) {
      await recordFail({ userId: password.userId });
      throw errors.unauthorized();
    }

    await users.update(user.id, {
      lastSignInAtUtc: new Date()
    });

    await recordFail({ userId: user.id, success: true });
    return user;
  }

  private _recordLoginAttempt(data: TRecordLoginAttemptProps) {
    return loginAttempts.create({
      loginType: "PASSWORD",
      appType: this.appType,

      remark: data.remark,
      remoteAddress: data.remoteAddress,
      success: data.success || false,

      userId: data.userId,
      identifier: data.identifier,
    });
  }
}
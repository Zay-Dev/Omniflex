import { errors, providers } from '@omniflex/core';

import { TUser } from './types';
import { resolve } from './containers';

const hashProvider = providers.hash;
const { users, profiles, passwords, loginAttempts } = resolve();

type TRegisterProfile = {
  email?: string;
  mobileNumber?: string;

  firstName?: string;
  lastName?: string;
} & Record<string, any>;

type TRecordLoginAttemptProps = {
  user?: TUser;
  identifier: string;
  remark?: any;
  success?: boolean;
  ipAddress?: string;
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

    const hashedPassword = await hashProvider.hash(password);
    const user = await users.create({ identifier: username });

    await passwords.create({
      user,
      username,
      hashedPassword,
    });

    await profiles.create({
      user,
      profile,

      email,
      firstName,
      lastName,
      mobileNumber,
    });

    return user;
  }

  async registerWithEmail(
    password: string,
    data: TRegisterProfile & { email: string; },
  ) {
    const email = data.email.toLowerCase().trim();

    return this.registerWithUsername(
      { password, username: email },
      { ...data, email },
    );
  }

  async login(values: {
    username: string;
    password: string;
    ipAddress?: string;
  }) {
    const recordFail = (data: Partial<TRecordLoginAttemptProps> = {}) => {
      return this._recordLoginAttempt({
        ...data,
        identifier: values.username,
        ipAddress: values.ipAddress,
        success: data.success || false,
      });
    };

    const password = await passwords.findByUsername(values.username);
    if (!password) {
      await recordFail();
      throw errors.unauthorized();
    }

    const isValidPassword = await hashProvider.verify(
      values.password,
      password.hashedPassword
    );

    if (!isValidPassword) {
      await recordFail({ user: password.user });
      throw errors.unauthorized();
    }

    const user = await users.findOne({ id: password.user.id });
    if (!user) {
      await recordFail({ user: password.user });
      throw errors.unauthorized();
    }

    await users.update(user.id, {
      lastSignInAtUtc: new Date()
    });

    await recordFail({ user, success: true });
    return user;
  }

  async loginWithEmail(values: {
    email: string;
    password: string;
    ipAddress?: string;
  }) {
    const email = values.email.toLowerCase().trim();

    return this.login({ ...values, username: email });
  }

  private _recordLoginAttempt(data: TRecordLoginAttemptProps) {
    return loginAttempts.create({
      loginType: "PASSWORD",
      appType: this.appType,

      remark: data.remark,
      ipAddress: data.ipAddress,
      success: data.success || false,

      user: data.user,
      identifier: data.user?.identifier || data.identifier,
    });
  }
}
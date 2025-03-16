export * from './entities';

export type TBodyRegister = {
  username: string;
  password: string;

  email?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
};

export type TBodyRegisterWithEmail = Omit<TBodyRegister, "username"> & {
  email: string;
};

export type TBodyLogin = {
  username: string;
  password: string;
};

export type TBodyLoginWithEmail = {
  email: string;
  password: string;
};
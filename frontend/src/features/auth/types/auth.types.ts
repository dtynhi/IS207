export type LoginUser = {
  id: string;
  fullName: string;
  email: string;
  tokenUser?: string;
};

export type LoginAdmin = {
  id: string;
  fullName: string;
  email: string;
};

export type ForgotPasswordResult = {
  email: string;
  otp: string;
  expireAt: string;
};

export type VerifyOtpResult = {
  userId: string;
  tokenUser: string | null;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
};

export type ForgotPasswordFormValues = {
  email: string;
};

export type OtpFormValues = {
  email: string;
  otp: string;
};

export type ResetPasswordFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

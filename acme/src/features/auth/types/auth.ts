export type AuthFormState = {
  error: { message: string } | null;
};

export type AuthUser = {
  id: string;
  email: string | null;
};

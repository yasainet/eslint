export type User = {
  id: string;
  username: string;
};

export type UpdateUsernameFormState = {
  error: { message: string } | null;
};

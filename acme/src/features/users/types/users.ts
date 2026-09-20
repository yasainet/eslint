export type User = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type UpdateUsernameFormState = {
  error: { message: string } | null;
};

export type UpdateAvatarFormState = {
  error: { message: string } | null;
};

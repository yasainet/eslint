import { z } from "zod";

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .regex(/^[a-z0-9_]{3,24}$/, "Use 3-24 characters: a-z, 0-9, _"),
});

export const userIdSchema = z.uuid();

const AVATAR_MAX_BYTES = 512 * 1024;

export const updateAvatarSchema = z.object({
  avatar: z
    .file()
    .min(1, "Choose an image")
    .max(AVATAR_MAX_BYTES, "Image can be up to 512 KB")
    .mime(["image/png", "image/jpeg", "image/webp"], "Use PNG, JPEG or WebP"),
});

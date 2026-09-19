import { z } from "zod";

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .regex(/^[a-z0-9_]{3,24}$/, "Use 3-24 characters: a-z, 0-9, _"),
});

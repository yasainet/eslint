import * as usersQueriesClient from "@/features/users/queries/client";
import type { User } from "@/features/users/types/users";
import { mapSnakeToCamel } from "@/utils/mapping";

export async function getUserList(): Promise<User[]> {
  const { data, error } = await usersQueriesClient.getUserList();

  if (error) {
    throw error;
  }

  return mapSnakeToCamel<User[]>(data);
}

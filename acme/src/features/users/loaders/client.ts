import * as usersServicesClient from "@/features/users/services/client";

export async function getUserList() {
  return usersServicesClient.getUserList();
}

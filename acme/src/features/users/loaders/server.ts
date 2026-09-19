import * as usersServicesServer from "@/features/users/services/server";

export async function getCurrentUser() {
  return usersServicesServer.getCurrentUser();
}

export async function getUserList() {
  return usersServicesServer.getUserList();
}

export async function getUser(id: string) {
  return usersServicesServer.getUser(id);
}

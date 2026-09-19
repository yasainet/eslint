import * as authServicesServer from "@/features/auth/services/server";

export async function getUser() {
  return authServicesServer.getUser();
}

import { PutObjectCommand } from "@aws-sdk/client-s3";

import { createClient } from "@/lib/garage";

export async function uploadAvatar(
  path: string,
  body: Uint8Array,
  contentType: string,
) {
  const garage = createClient();

  return garage.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: path,
      Body: body,
      ContentType: contentType,
    }),
  );
}

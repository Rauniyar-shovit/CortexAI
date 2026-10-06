import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3";

import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  AWS_BUCKET: str(),
});

export const uploadToS3 = async (
  fileName: string,
  buffer: Buffer,
  contentType: string,
) => {
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_BUCKET,
        Body: buffer,
        Key: fileName,
        ContentType: contentType,
      }),
    );
  } catch (error) {
    console.error(`Failed to upload ${fileName} to S3:`, error);
    throw new Error(`S3 upload failed for ${fileName}`, { cause: error });
  }
};

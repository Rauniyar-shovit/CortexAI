import { S3Client } from "@aws-sdk/client-s3";

import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  AWS_REGION: str(),
  AWS_ACCESS_KEY: str(),
  AWS_SECRET_ACCESS_KEY: str(),
});

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

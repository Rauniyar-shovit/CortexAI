import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  AWS_BUCKET: str(),
});

export const getFromS3 = async (fileName: string, expiresIn = 600) => {
  try {
    return await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: env.AWS_BUCKET,
        Key: fileName,
      }),
      { expiresIn },
    );
  } catch (error) {
    console.error(`Failed to fetch ${fileName} from S3:`, error);
    throw new Error(`S3 fetch failed for ${fileName}`, { cause: error });
  }
};

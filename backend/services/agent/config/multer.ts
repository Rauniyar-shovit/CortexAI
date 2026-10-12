import path from "path";
import fs from "fs";
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

const uploadDir = path.resolve("./temp");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (file.mimetype === "application/pdf" || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed"));
  }
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

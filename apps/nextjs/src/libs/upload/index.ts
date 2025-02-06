import { upload as vercelBlobUpload } from "@vercel/blob/client";

type UploadParams = {
  file: File;
  fileName: string;
};
const upload = ({ file, fileName }: UploadParams) => {
  return vercelBlobUpload(fileName, file, {
    access: "public",
    handleUploadUrl: "/api/images/upload",
  });
};
export { upload };

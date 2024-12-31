import { useState } from "react";

import { cn } from "@acme/ui";

import type { InsertImagePayload } from "./types";
import { message } from "../../../toast";
import { useEditor } from "../../store";

type UploadProps = {
  onUploadSuccess: (payload: InsertImagePayload) => void;
};
export const Uploader = ({ onUploadSuccess }: UploadProps) => {
  const { uploadService } = useEditor();
  const [dragActive, setDragActive] = useState(false);

  const upload = async (file: File) => {
    if (file.size / 1024 / 1024 > 50) {
      message.error("File size too big (max 50MB)");
    } else {
      const blob = await uploadService({
        file: file,
        fileName: file.name,
      });
      onUploadSuccess({
        src: blob.url,
        altText: blob.fileName,
      });
      // const reader = new FileReader();
      // reader.onload = async () => {
      //   console.log(
      //     "aaaa",
      //     file,
      //     typeof reader.result,
      //     reader.result instanceof ArrayBuffer,
      //     reader.result,
      //   );
      //   // if (reader.result instanceof ArrayBuffer) {
      //   if (typeof reader.result === "string") {
      //     const blob = await apiUpload({
      //       file: reader.result,
      //       fileName: file.name,
      //     });
      //     onUploadSuccess({
      //       src: blob.url,
      //       altText: blob.fileName,
      //     });
      //   }
      // };
      // reader.readAsBinaryString(file);
      // reader.readAsArrayBuffer(file);
      // reader.readAsDataURL(file);

      // setFile(file);
      // const reader = new FileReader();
      // reader.onload = (e) => {
      //   setData((prev) => ({
      //     ...prev,
      //     image: e.target?.result as string,
      //   }));
      // };
      // reader.readAsDataURL(file);
    }
  };
  return (
    <div>
      <form>
        <label
          htmlFor="image-upload"
          className="group relative mt-2 flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
        >
          <div
            className="absolute z-[5] size-full rounded-md"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);

              const file = e.dataTransfer.files[0];
              if (file) {
                await upload(file);
              }
            }}
          />
          <div
            className={cn(
              "absolute z-[3] flex size-full flex-col items-center justify-center rounded-md px-10 transition-all",
              dragActive && "border-2 border-black",
              "bg-white opacity-100 hover:bg-gray-50",
            )}
            // className={`${
            //   dragActive ? "border-2 border-black" : ""
            // }  ${
            //   data.image
            //     ? "bg-white/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md"
            //     :
            // }`}
          >
            <svg
              className={`${
                dragActive ? "scale-110" : "scale-100"
              } size-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
              <path d="M12 12v9"></path>
              <path d="m16 16-4-4-4 4"></path>
            </svg>
            <p className="mt-2 text-center text-sm text-gray-500">
              Drag and drop or click to upload.
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              Max file size: 50MB
            </p>
            <span className="sr-only">Photo upload</span>
          </div>
          {/* {data.image && ( */}
          {/*   // eslint-disable-next-line @next/next/no-img-element */}
          {/*   <img */}
          {/*     src={data.image} */}
          {/*     alt="Preview" */}
          {/*     className="h-full w-full rounded-md object-cover" */}
          {/*   /> */}
          {/* )} */}
        </label>

        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            id="image-upload"
            name="image"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (file) await upload(file);
            }}
          />
        </div>
      </form>
    </div>
  );
};

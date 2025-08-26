import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { cn } from "@acme/ui/lib/utils";

import type { UploadFileItem, UploadService } from "./types";
import { Card } from "../components/card";
// import { Icon } from "../icons";
import { message } from "../components/message";
import ProgressBar from "./_components/progress-bar";

type UploadZoneProps = Omit<
  React.ComponentProps<"div">,
  "children" | "onChange"
> & {
  accept?: string;
  uploadService?: UploadService;
  onUploadSuccess?: (data: UploadFileItem) => void;

  file?: UploadFileItem;
  progress?: {
    percent?: number;
  };

  // listType?: "picture-card";
  // placeholder?: string;
  children?: (
    fileInputRef: React.RefObject<HTMLInputElement | null>,
    reset: () => void,
  ) => React.ReactNode;

  overrideClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

  showZoneOnly?: boolean;
  showUploadList?: boolean;

  onChange?: (file: UploadFileItem | undefined) => void;
};
const UploadZone = ({
  uploadService,
  onUploadSuccess,

  file: fileProp,
  progress,
  // render,
  children,
  // listType,
  // placeholder,

  className,

  overrideClick,

  showZoneOnly,
  showUploadList,
  onChange,
  ...props
}: UploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | undefined>(fileProp?.url);
  // const [_file, setFile] = useState<File>();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  function reset() {
    setIsUploading(false);
    // setFile(undefined);
    // eslint-disable-next-line unicorn/no-useless-undefined
    onChange?.(undefined);

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(undefined);
  }

  const upload = async (file: File) => {
    // if (file.size / 1024 / 1024 > 50) {
    //   message.error("File size too big (max 50MB)");
    //   return
    // }
    setIsUploading(true);
    const blob = await uploadService?.(
      {
        uid: file.name,
        file: file,
        fileName: file.name,
      },
      reset,
    );
    setIsUploading(false);
    if (blob?.success) {
      reset();
      onUploadSuccess?.({
        uid: file.name,
        url: blob.url,
        name: blob.fileName,
      });
    }

    // const reader = new FileReader();
    // reader.onload = async () => {
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
  };

  function handleFileChange(file: File) {
    message.dismiss();

    if (file.type.split("/")[0] !== "image") {
      message.error("We only accept image files");
      return;
    }

    if (file.size / 1024 / 1024 > 50) {
      message.error("File size too big (max 50MB)");
      return;
    }

    // setFile(file);
    onChange?.({
      uid: file.name + "-" + uuidv4(),
      name: file.name,
      url: URL.createObjectURL(file),
      blob: file,
    });
    if (showZoneOnly && fileInputRef.current) {
      fileInputRef.current.value = "";
    } else {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <>
      <Card
        className={cn(
          "w-full border-2 border-dashed",
          preview && showUploadList && "rounded-md border-solid",
          className,
        )}
        classNames={{
          // content: "h-full relative p-0",
          content: "flex items-center h-full justify-center flex-col relative",
        }}
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
            handleFileChange(file);
          }
        }}
        onClick={(event) => {
          if (overrideClick) {
            overrideClick(event);
          } else {
            fileInputRef.current?.click();
          }
        }}
        {...props}
      >
        {preview && showUploadList ? (
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-contain"
          />
        ) : children ? (
          <div>{children(fileInputRef, reset)}</div>
        ) : (
          <div
            className={cn(
              "absolute z-3 flex size-full flex-col items-center justify-center rounded-md px-10 transition-all",
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
        )}
        {isUploading && <ProgressBar value={progress?.percent ?? 0} />}
        <input
          hidden
          ref={fileInputRef}
          // id="image-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            if (file) {
              await upload(file);
              handleFileChange(file);
            }
          }}
        />
      </Card>

      {/* {listType === "picture-card" ? ( */}
      {/*   <div className="flex flex-col items-center gap-2"> */}
      {/*     <Icon icon="icon-[mingcute--add-fill]" /> */}
      {/*     <span>{placeholder ?? "Upload"}</span> */}
      {/*   </div> */}
      {/* ) : ( */}
      {/*   <div */}
      {/*     className={cn( */}
      {/*       "absolute z-3 flex size-full flex-col items-center justify-center rounded-md px-10 transition-all", */}
      {/*       dragActive && "border-2 border-black", */}
      {/*       "bg-white opacity-100 hover:bg-gray-50", */}
      {/*     )} */}
      {/*     // className={`${ */}
      {/*     //   dragActive ? "border-2 border-black" : "" */}
      {/*     // }  ${ */}
      {/*     //   data.image */}
      {/*     //     ? "bg-white/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md" */}
      {/*     //     : */}
      {/*     // }`} */}
      {/*   > */}
      {/*     <svg */}
      {/*       className={`${ */}
      {/*         dragActive ? "scale-110" : "scale-100" */}
      {/*       } size-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`} */}
      {/*       xmlns="http://www.w3.org/2000/svg" */}
      {/*       width="24" */}
      {/*       height="24" */}
      {/*       viewBox="0 0 24 24" */}
      {/*       fill="none" */}
      {/*       stroke="currentColor" */}
      {/*       strokeWidth="2" */}
      {/*       strokeLinecap="round" */}
      {/*       strokeLinejoin="round" */}
      {/*     > */}
      {/*       <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path> */}
      {/*       <path d="M12 12v9"></path> */}
      {/*       <path d="m16 16-4-4-4 4"></path> */}
      {/*     </svg> */}
      {/*     <p className="mt-2 text-center text-sm text-gray-500"> */}
      {/*       Drag and drop or click to upload. */}
      {/*     </p> */}
      {/*     <p className="mt-2 text-center text-sm text-gray-500"> */}
      {/*       Max file size: 50MB */}
      {/*     </p> */}
      {/*     <span className="sr-only">Photo upload</span> */}
      {/*   </div> */}
      {/* )} */}
      {/* {data.image && ( */}
      {/*   // eslint-disable-next-line @next/next/no-img-element */}
      {/*   <img */}
      {/*     src={data.image} */}
      {/*     alt="Preview" */}
      {/*     className="h-full w-full rounded-md object-cover" */}
      {/*   /> */}
      {/* )} */}

      {/* </label> */}
    </>
  );
};

export type { UploadZoneProps };
export { UploadZone };

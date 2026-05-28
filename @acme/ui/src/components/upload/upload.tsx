// https://github.com/vercel/examples/tree/main/storage/blob-starter
// https://github.com/react-component/upload/blob/master/src/Upload.tsx

import { useMergedState } from "@rc-component/util";

import type { DraggerProps as DraggerProperties } from "./dragger";
import type { DownloadService, UploadFileItem, UploadService } from "./types";
import { DeleteIcon, DownloadIcon, Icon } from "../../icons";
import { Button } from "../button";
import { Card } from "../card";
import { message } from "../message";
import { Dragger } from "./dragger";

type UploadProperties = Omit<DraggerProperties, "defaultValue" | "onChange"> & {
  listType?: "picture-card";
  showZone?: boolean;
  /** show upload zone only (not show list or plus button) */
  showZoneOnly?: boolean;
  showUploadButton?: boolean;
  /** Maximum number of files that can be uploaded */
  maxCount?: number;
  // children?: React.ReactNode;
  render?: {
    image: (file: UploadFileItem) => React.ReactNode;
  };
  uploadService?: UploadService;
  downloadService?: DownloadService;

  /* styles */
  width?: number;
  height?: number;
} & (
    | {
        multiple?: false;
        fileList?: string;
        defaultValue?: string;
        onChange?: (value: string | undefined) => void;

        // value?: FileItem;
        // defaultValue?: FileItem;
        // onChange?: (value: FileItem | undefined) => void;
      }
    | {
        multiple: true;
        fileList?: UploadFileItem[];
        defaultValue?: UploadFileItem[];
        onChange?: (value: UploadFileItem[]) => void;
      }
  );
const Upload = ({
  progress,
  // defaultValue,
  uploadService,
  downloadService,

  width = 100,
  height = 100,

  render,
  listType,
  // placeholder,

  children,

  overrideClick,

  showZoneOnly = false,
  showUploadButton = true,
  showUploadList = true,
  maxCount,
  // value,
  ...properties
}: UploadProperties) => {
  const [files, setFiles] = useMergedState<UploadFileItem[]>(
    properties.defaultValue
      ? Array.isArray(properties.defaultValue)
        ? properties.defaultValue
        : [
            {
              uid: properties.defaultValue,
              url: properties.defaultValue,
              name: properties.defaultValue,
            },
          ]
      : [],
    {
      value: properties.fileList
        ? Array.isArray(properties.fileList)
          ? properties.fileList
          : [
              {
                uid: properties.fileList,
                url: properties.fileList,
                name: properties.fileList,
              },
            ]
        : [],
      onChange: (value) => {
        if (properties.multiple) {
          properties.onChange?.(value);
        } else {
          properties.onChange?.(value[0]?.url);
        }
      },
    },
  );

  // Helper function to check if we can add more files
  const canAddMoreFiles = (currentFiles: UploadFileItem[]) => {
    if (!maxCount) return true;
    return currentFiles.length < maxCount;
  };

  // Helper function to add files with maxCount validation
  const addFile = (newFile: UploadFileItem) => {
    if (!canAddMoreFiles(files)) {
      message.error(`Maximum ${maxCount} file(s) allowed`);
      return;
    }
    setFiles([...files, newFile]);
  };

  //   const [inputFile, setInputFile] = useState<File | null>(null)
  // const [isUploading, setIsUploading] = useState(false);
  //
  //    function reset() {
  //   setIsUploading(false)
  //   setInputFile(null)
  //   // if (preview) {
  //   //   URL.revokeObjectURL(preview)
  //   // }
  //   // setPreview(null)
  // }

  return (
    <div>
      {/* {children && ( */}
      {/*   <UploadZone */}
      {/*     progress={progress} */}
      {/*     // listType={listType} */}
      {/*     // style={{ width, height }} */}
      {/*     uploadService={uploadService} */}
      {/*     onUploadSuccess={(file) => { */}
      {/*       setFiles([...files, file]); */}
      {/*     }} */}
      {/*   > */}
      {/*     {children} */}
      {/*   </UploadZone> */}
      {/* )} */}

      {!properties.multiple && (
        <>
          {/* <UploadZone style={{ width, height }}>{children}</UploadZone> */}
          {files.length > 0 ? (
            <div className="group relative" style={{ width, height }}>
              {render?.image && files[0] ? (
                render.image(files[0])
              ) : (
                <picture>
                  <img
                    src={files[0]?.url}
                    alt={files[0]?.name}
                    width={width}
                    height={height}
                    className="object-cover"
                  />
                </picture>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                <Button
                  icon={<DeleteIcon />}
                  variant="text"
                  className="p-1 text-white hover:bg-black/10"
                  title="Remove file"
                  onClick={() => {
                    setFiles([]);
                  }}
                />
              </div>
            </div>
          ) : (
            <Dragger
              // listType={listType}
              // placeholder={placeholder}
              style={{ width, height }}
              uploadService={uploadService}
              onUploadSuccess={(file) => {
                addFile(file);
              }}
              overrideClick={overrideClick}
            >
              {children}
            </Dragger>
          )}
        </>
      )}

      {properties.multiple && listType !== "picture-card" && (
        <>
          <div className="mt-2 flex w-full flex-col gap-2">
            {files.length === 0 ? (
              <Dragger
                progress={progress}
                // listType={listType}
                // style={{ width, height }}
                uploadService={uploadService}
                onUploadSuccess={(file) => {
                  addFile(file);
                }}
                onChange={(file) => {
                  if (file) {
                    addFile(file);
                  }
                }}
              >
                {children}
              </Dragger>
            ) : canAddMoreFiles(files) ? (
              <Dragger
                progress={progress}
                // listType={listType}
                // style={{ width, height }}
                uploadService={uploadService}
                onUploadSuccess={(file) => {
                  addFile(file);
                }}
                onChange={(file) => {
                  if (file) {
                    addFile(file);
                  }
                }}
              >
                {children}
              </Dragger>
            ) : undefined}
            {files.length > 0 &&
              files.map((item, index) => (
                <Card
                  key={index}
                  classNames={{
                    content: "lg:p-4 flex items-center text-sm",
                  }}
                >
                  {["pdf", "png", "jpg", "jpeg", "svg"].includes(
                    item.name.slice(item.name.lastIndexOf(".") + 1),
                  ) && (
                    <Icon
                      icon="icon-[majesticons--image-line]"
                      className="size-6"
                    />
                  )}
                  <span className="px-2">{item.name}</span>
                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="text"
                      color="success"
                      icon={<DownloadIcon />}
                      onClick={async () => {
                        await downloadService?.({
                          file: item,
                        });
                      }}
                    />
                    <Button
                      variant="text"
                      color="danger"
                      icon={<DeleteIcon />}
                      onClick={() => {
                        setFiles(files.filter((_, fi) => fi !== index));
                      }}
                    />
                  </div>
                </Card>
              ))}
          </div>
        </>
      )}

      {properties.multiple && listType === "picture-card" && (
        <div className="flex gap-2">
          {showZoneOnly && (
            <Dragger
              className="cursor-pointer"
              showZoneOnly={showZoneOnly}
              // style={{ width, height }}
              overrideClick={overrideClick}
              progress={progress}
              uploadService={uploadService}
              onUploadSuccess={(file) => {
                addFile(file);
              }}
              onChange={(file) => {
                if (file) {
                  addFile(file);
                }
              }}
            >
              {children}
            </Dragger>
          )}
          {!showZoneOnly &&
            showUploadList &&
            files.map((file, index) => {
              return (
                <Dragger key={index} style={{ width, height }} file={file}>
                  {() => {
                    return "+";
                  }}
                </Dragger>
              );
            })}
          {!showZoneOnly && showUploadButton && canAddMoreFiles(files) && (
            <Dragger
              className="cursor-pointer"
              style={{ width, height }}
              overrideClick={overrideClick}
              progress={progress}
              uploadService={uploadService}
              onUploadSuccess={(file) => {
                addFile(file);
              }}
              // onChange={(file) => {
              // }}
            >
              {files.length === 0
                ? children
                : () => {
                    return "+";
                  }}
            </Dragger>
          )}
        </div>
      )}
    </div>
  );
};

export { Upload };
export type { UploadProperties as UploadProps };

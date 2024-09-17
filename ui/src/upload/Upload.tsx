// https://github.com/vercel/examples/tree/main/storage/blob-starter
// https://github.com/react-component/upload/blob/master/src/Upload.tsx

import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { useMergedState } from "rc-util";

import type { DownloadService, FileItem, UploadService } from "./types";
import { Button } from "../button";
import { Card } from "../card";
import { DeleteIcon, DownloadIcon, Icon } from "../icons";
import { UploadZone } from "./upload-zone";

type UploadProps = {
  render?: {
    image: (file: FileItem) => React.ReactNode;
  };
  uploadService?: UploadService;
  downloadService?: DownloadService;

  /* styles */
  width?: number;
  height?: number;
} & (
  | {
      multiple?: false;
      value?: string;
      defaultValue?: string;
      onChange?: (value: string | undefined) => void;

      // value?: FileItem;
      // defaultValue?: FileItem;
      // onChange?: (value: FileItem | undefined) => void;
    }
  | {
      multiple: true;
      value?: FileItem[];
      defaultValue?: FileItem[];
      onChange?: (value: FileItem[] | undefined) => void;
    }
);
const Upload = forwardRef(
  (
    {
      render,
      // value,
      // defaultValue,
      uploadService,
      downloadService,

      width,
      height,

      ...props
    }: UploadProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    // const {
    //   multiple: _,
    //   value,
    //   defaultValue,
    //   uploadService,
    //   downloadService,
    //   onChange: __,
    //   ...rest
    // } = props;

    const [files, setFiles] = useMergedState<FileItem[]>(
      props.defaultValue
        ? Array.isArray(props.defaultValue)
          ? props.defaultValue
          : [{ url: props.defaultValue, name: props.defaultValue }]
        : [],
      {
        value: props.value
          ? Array.isArray(props.value)
            ? props.value
            : [{ url: props.value, name: props.value }]
          : [],
        onChange: (value) => {
          console.log("xx", value);
          if (props.multiple) {
            props.onChange?.(value);
          } else {
            props.onChange?.(value[0]?.url);
          }
        },
      },
    );

    console.log("fffff", props.value, files, width, height);

    return (
      <div ref={ref}>
        {!props.multiple && (
          <>
            {files.length > 0 ? (
              <div className="group relative" style={{ width, height }}>
                {render?.image ? (
                  render.image(files[0]!)
                ) : (
                  <img src={files[0]?.url} />
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <Button
                    icon={<DeleteIcon />}
                    variant="ghost"
                    className="p-1 text-white hover:bg-black/10"
                    title="Remove file"
                    onClick={() => {
                      console.log("/");
                      setFiles([]);
                    }}
                  />
                </div>
              </div>
            ) : (
              <UploadZone
                uploadService={uploadService}
                onUploadSuccess={(file) => {
                  setFiles([file]);
                }}
              />
            )}
          </>
        )}

        {props.multiple && (
          <>
            <UploadZone
              uploadService={uploadService}
              onUploadSuccess={(file) => {
                setFiles([...files, file]);
              }}
            />
            <div className="mt-2 flex w-full flex-col gap-2">
              {files.map((item, index) => (
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
                      variant="ghost"
                      color="success"
                      icon={<DownloadIcon />}
                      onClick={async () => {
                        await downloadService?.({
                          file: item,
                          fileName: item.name,
                        });
                      }}
                    />
                    <Button
                      variant="ghost"
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
      </div>
    );
  },
);

export { Upload };
export type { UploadProps };

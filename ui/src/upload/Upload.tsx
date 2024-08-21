// https://github.com/vercel/examples/tree/main/storage/blob-starter
// https://github.com/react-component/upload/blob/master/src/Upload.tsx

import type { ForwardedRef } from "react";
import { forwardRef } from "react";
import { useMergedState } from "rc-util";

import type { DownloadService, FileItem, UploadService } from "./types";
import { Button } from "../button";
import { Card } from "../card";
import { DeleteIcon, DownloadIcon, Icon } from "../icons";
import { UploadZone } from "./UploadZone";

type UploadProps = {
  uploadService?: UploadService;
  downloadService?: DownloadService;
} & (
  | {
      multiple?: false;
      value?: FileItem;
      defaultValue?: FileItem;
      onChange?: (value: FileItem | undefined) => void;
    }
  | {
      multiple: true;
      value?: FileItem[];
      defaultValue?: FileItem[];
      onChange?: (value: FileItem[] | undefined) => void;
    }
);
const Upload = forwardRef(
  (props: UploadProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      multiple: _,
      value,
      defaultValue,
      uploadService,
      downloadService,
      onChange: __,
      ...rest
    } = props;
    const [files, setFiles] = useMergedState(defaultValue, {
      value,
      onChange: (value) => {
        if (!props.multiple && !Array.isArray(value)) {
          props.onChange?.(value);
        } else if (props.multiple && Array.isArray(value)) {
          props.onChange?.(value);
        }
      },
    });

    return (
      <div ref={ref} {...rest}>
        {!Array.isArray(files) && files ? (
          <>{files.name}</>
        ) : (
          <UploadZone
            uploadService={uploadService}
            onUploadSuccess={(file) => {
              if (!props.multiple && !Array.isArray(files)) {
                setFiles(file);
              } else if (props.multiple && Array.isArray(files)) {
                setFiles([...files, file]);
              }
            }}
          />
        )}
        {Array.isArray(files) && (
          <div className="mt-2 flex w-full flex-col gap-2">
            {files.map((item, idx) => (
              <Card
                key={idx}
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
                      if (!props.multiple && !Array.isArray(files)) {
                        setFiles(undefined);
                      } else if (props.multiple && Array.isArray(files)) {
                        setFiles(files.filter((_, fi) => fi !== idx));
                      }
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  },
);

export { Upload };
export type { UploadProps };

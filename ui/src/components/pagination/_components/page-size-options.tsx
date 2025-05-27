import type { PaginationLocale } from "../types";
import { Select } from "../../select";

const defaultPageSizeOptions = [10, 20, 50, 100];

type SizeChangerRender = (info: {
  disabled: boolean | undefined;
  size: number;
  onSizeChange: (value: string | number) => void;
  "aria-label": string | undefined;
  className: string;
  options: {
    label: string;
    value: string | number;
  }[];
}) => React.ReactNode;

interface OptionsProps {
  disabled?: boolean;
  locale: PaginationLocale;
  pageSize: number;
  pageSizeOptions?: number[];
  // goButton?: boolean | string;
  changeSize?: (size: number) => void;
  // quickGo?: (value: number) => void;
  buildOptionText?: (value: number | string) => string;
  sizeChangerRender?: SizeChangerRender;
}

const PageSizeOptions = ({
  pageSizeOptions = defaultPageSizeOptions,
  locale,
  changeSize,
  pageSize,
  // goButton,
  // quickGo,
  // rootPrefixCls,
  disabled,
  buildOptionText,
  sizeChangerRender,
}: OptionsProps) => {
  const mergeBuildOptionText =
    typeof buildOptionText === "function"
      ? buildOptionText
      : (value: string | number) => `${value} ${locale.items_per_page}`;

  const getPageSizeOptions = () => {
    if (
      pageSizeOptions.some(
        (option) => option.toString() === pageSize.toString(),
      )
    ) {
      return pageSizeOptions;
    }
    return [...pageSizeOptions, pageSize].sort((a, b) => {
      const numberA = Number.isNaN(Number(a)) ? 0 : Number(a);
      const numberB = Number.isNaN(Number(b)) ? 0 : Number(b);
      return numberA - numberB;
    });
  };

  // ============== render ==============
  let changeSelect: React.ReactNode = <></>;
  // >>>>> Size Changer
  changeSelect = sizeChangerRender ? (
    sizeChangerRender({
      disabled,
      size: pageSize,
      onSizeChange: (nextValue) => {
        changeSize?.(Number(nextValue));
      },
      "aria-label": locale.page_size,
      className: ``,
      options: getPageSizeOptions().map((opt) => ({
        label: mergeBuildOptionText(opt),
        value: opt,
      })),
    })
  ) : (
    <Select
      value={pageSize}
      options={getPageSizeOptions().map((opt) => ({
        label: mergeBuildOptionText(opt),
        value: opt,
      }))}
      onChange={(value) => {
        if (value) {
          changeSize?.(value);
        }
      }}
    />
  );
  return <li className="ml-1">{changeSelect}</li>;
};

export type { OptionsProps, SizeChangerRender };
export { PageSizeOptions };

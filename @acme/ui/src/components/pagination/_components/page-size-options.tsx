// Keep page-size options on the local components/select entry.
// The source runtime still uses the full wrapper, while registry artifacts remap this
// path to a closure-safe primitive export so copied files stay self-contained.
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../select";

import type { PaginationLocale } from "../types";

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
    return [...pageSizeOptions, pageSize].toSorted((a, b) => {
      const numberA = Number.isNaN(Number(a)) ? 0 : Number(a);
      const numberB = Number.isNaN(Number(b)) ? 0 : Number(b);
      return numberA - numberB;
    });
  };

  // ============== render ==============
  // >>>>> Size Changer
  const changeSelect = sizeChangerRender ? (
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
      disabled={disabled}
      value={String(pageSize)}
      onValueChange={(value) => {
        if (value) {
          changeSize?.(Number(value));
        }
      }}
    >
      <SelectTrigger aria-label={locale.page_size} className="min-w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {getPageSizeOptions().map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {mergeBuildOptionText(opt)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
  return <li className="ml-1">{changeSelect}</li>;
};

export type { OptionsProps, SizeChangerRender };
export { PageSizeOptions };

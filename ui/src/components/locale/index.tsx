import type { TransferLocale as TransferLocaleForEmpty } from "../empty";
import type { PaginationLocale } from "../pagination/types";
import type { TableLocale } from "../table";

export { default as useLocale } from "./use-locale";

export interface Locale {
  locale: string;
  Pagination?: PaginationLocale;
  // DatePicker?: DatePickerLocale;
  TimePicker?: Record<string, any>;
  Calendar?: Record<string, any>;
  Table?: TableLocale;
  // Modal?: ModalLocale;
  // Tour?: TourLocale;
  // Popconfirm?: PopconfirmLocale;
  // Transfer?: TransferLocale;
  Select?: Record<string, any>;
  // Upload?: UploadLocale;
  Empty?: TransferLocaleForEmpty;
  global?: {
    placeholder?: string;
    close?: string;
  };
  Icon?: Record<string, any>;
  Text?: {
    edit?: any;
    copy?: any;
    copied?: any;
    expand?: any;
    collapse?: any;
  };
  Form?: {
    optional?: string;
    //   defaultValidateMessages: ValidateMessages;
  };
  Image?: {
    preview: string;
  };
  QRCode?: {
    expired?: string;
    refresh?: string;
    scanned?: string;
  };
  ColorPicker?: {
    presetEmpty: string;
    transparent: string;
    singleColor: string;
    gradientColor: string;
  };
}

import React from "react";

import type { WarningContextProps } from "../_util/warning";
import type { ShowWaveEffect } from "../../lib/wave/interface";
import type { Locale } from "../locale";
import type { TableProps } from "../table";
import type { RenderEmptyHandler } from "./default-render-empty";

export interface CSPConfig {
  nonce?: string;
}

export type DirectionType = "ltr" | "rtl" | undefined;

export interface TableConfig extends ComponentStyleConfig {
  bordered?: TableProps["bordered"];
  expandable?: {
    expandIcon?: NonNullable<TableProps["expandable"]>["expandIcon"];
  };
}

export type PopupOverflow = "viewport" | "scroll";

export interface ComponentStyleConfig {
  className?: string;
  style?: React.CSSProperties;
}

export const Variants = [
  "outlined",
  "borderless",
  "filled",
  "underlined",
] as const;

export type Variant = (typeof Variants)[number];

export interface WaveConfig {
  /**
   * @descEN Whether to use wave effect. If it needs to close, set to `false`.
   * @default true
   */
  disabled?: boolean;
  /**
   * @descEN Customized wave effect.
   */
  showEffect?: ShowWaveEffect;
}

export interface ConfigComponentProps {
  // input?: InputConfig;
  // textArea?: TextAreaConfig;
  // inputNumber?: InputNumberConfig;
  // pagination?: PaginationConfig;
  // space?: SpaceConfig;
  // splitter?: ComponentStyleConfig;
  // form?: FormConfig;
  // select?: SelectConfig;
  // alert?: AlertConfig;
  // anchor?: ComponentStyleConfig;
  // button?: ButtonConfig;
  // divider?: ComponentStyleConfig;
  // drawer?: DrawerConfig;
  // calendar?: ComponentStyleConfig;
  // carousel?: ComponentStyleConfig;
  // cascader?: CascaderConfig;
  // treeSelect?: TreeSelectConfig;
  // collapse?: CollapseConfig;
  // floatButtonGroup?: FloatButtonGroupConfig;
  // typography?: ComponentStyleConfig;
  // skeleton?: ComponentStyleConfig;
  // spin?: SpinConfig;
  // segmented?: ComponentStyleConfig;
  // steps?: ComponentStyleConfig;
  // statistic?: ComponentStyleConfig;
  // image?: ImageConfig;
  // layout?: ComponentStyleConfig;
  // list?: ListConfig;
  // mentions?: MentionsConfig;
  // modal?: ModalConfig;
  // progress?: ComponentStyleConfig;
  // result?: ComponentStyleConfig;
  // slider?: SliderConfig;
  // breadcrumb?: ComponentStyleConfig;
  // menu?: MenuConfig;
  checkbox?: ComponentStyleConfig;
  // descriptions?: DescriptionsConfig;
  // empty?: EmptyConfig;
  // badge?: BadgeConfig;
  // radio?: ComponentStyleConfig;
  // rate?: ComponentStyleConfig;
  // switch?: ComponentStyleConfig;
  // transfer?: TransferConfig;
  // avatar?: ComponentStyleConfig;
  // message?: ComponentStyleConfig;
  // tag?: TagConfig;
  table?: TableConfig;
  // card?: CardConfig;
  // tabs?: TabsConfig;
  // timeline?: ComponentStyleConfig;
  // timePicker?: TimePickerConfig;
  // tour?: TourConfig;
  // tooltip?: TooltipConfig;
  // popover?: PopoverConfig;
  // popconfirm?: PopconfirmConfig;
  // upload?: ComponentStyleConfig;
  // notification?: NotificationConfig;
  // tree?: ComponentStyleConfig;
  // colorPicker?: ComponentStyleConfig;
  // datePicker?: DatePickerConfig;
  // rangePicker?: RangePickerConfig;
  // dropdown?: ComponentStyleConfig;
  // flex?: FlexConfig;
  wave?: WaveConfig;
}

export interface ConfigConsumerProps extends ConfigComponentProps {
  getTargetContainer?: () => HTMLElement;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  // rootPrefixCls?: string;
  // iconPrefixCls: string;
  // getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => string;
  renderEmpty?: RenderEmptyHandler;
  /**
   * @descEN Set the [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) config.
   */
  csp?: CSPConfig;
  /** @deprecated Please use `{ button: { autoInsertSpace: boolean }}` instead */
  autoInsertSpaceInButton?: boolean;
  variant?: Variant;
  virtual?: boolean;
  locale?: Locale;
  direction?: DirectionType;
  popupMatchSelectWidth?: boolean;
  popupOverflow?: PopupOverflow;
  // theme?: ThemeConfig;
  warning?: WarningContextProps;
}

// zombieJ: 🚨 Do not pass `defaultRenderEmpty` here since it will cause circular dependency.
export const ConfigContext = React.createContext<ConfigConsumerProps>({
  // We provide a default function for Context without provider
  // getPrefixCls: defaultGetPrefixCls,
  // iconPrefixCls: defaultIconPrefixCls,
});

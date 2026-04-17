/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

import type { WarningContextProps } from "../_util/warning";
import type { Locale } from "../locale";
import type { PaginationProps } from "../pagination";
import type { TableProps } from "../table";

export type AliasToken = Record<PropertyKey, any>;
export type MappingAlgorithm = (...args: any[]) => AliasToken;
export type OverrideToken = Record<string, AliasToken>;

export type RenderEmptyHandler = (
  componentName?:
    | "Table"
    | "Table.filter"
    | "List"
    | "Select"
    | "TreeSelect"
    | "Cascader"
    | "Transfer"
    | "Mentions",
) => React.ReactNode;

export type WaveComponent = "Tag" | "Button" | "Checkbox" | "Radio" | "Switch";
export type ShowWaveEffect = (
  element: HTMLElement,
  info: {
    className: string;
    component?: WaveComponent;
    event: MouseEvent;
  },
) => void;

export interface CSPConfig {
  nonce?: string;
}

export type DirectionType = "ltr" | "rtl" | undefined;

type ComponentsConfig = {
  [key in keyof OverrideToken]?: OverrideToken[key] & {
    algorithm?: boolean | MappingAlgorithm | MappingAlgorithm[];
  };
};

export interface ThemeConfig {
  /**
   * @descEN Modify Design Token.
   */
  token?: Partial<AliasToken>;
  /**
   * @descEN Modify Component Token and Alias Token applied to components.
   */
  components?: ComponentsConfig;
}
export interface ComponentStyleConfig {
  className?: string;
  style?: React.CSSProperties;
}

type SemanticClassNames = Record<string, string>;
type SemanticStyles = Record<string, React.CSSProperties>;
type AllowClearConfig = boolean | { clearIcon?: React.ReactNode };

// Keep these config shapes local instead of deriving them from button/form/tag
// modules. This context is copied into registry artifacts in isolation, so
// importing those modules here would reintroduce broader transitive fanout.
type ButtonTypeConfig =
  | "default"
  | "primary"
  | "dashed"
  | "link"
  | "text"
  | "submit"
  | "reset"
  | "button";
type ButtonVariantConfig =
  | "solid"
  | "outlined"
  | "dashed"
  | "filled"
  | "link"
  | "text";
type ButtonColorConfig =
  | "default"
  | "primary"
  | "danger"
  | "link"
  | "success"
  | "gray"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";
type ButtonSizeConfig = "small" | "middle" | "large";
type DatePickerCaptionLayout =
  | "label"
  | "dropdown"
  | "dropdown-months"
  | "dropdown-years";
type FormLayoutConfig = "horizontal" | "vertical";
type FormLabelAlignConfig = "left" | "right";
type TagVariantConfig =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "filled"
  | "solid"
  | "outlined";
type TagNamedColorConfig =
  | "default"
  | "primary"
  | "success"
  | "processing"
  | "error"
  | "warning"
  | "orange"
  | "gray"
  | "yellow"
  | "amber"
  | "lime"
  | "blue"
  | "indigo"
  | "fuchsia"
  | "green"
  | "cyan"
  | "red"
  | "rose"
  | "pink"
  | "purple"
  | "teal"
  | "green-solid";

type TagColorConfig = TagNamedColorConfig | `#${string}`;
type TagSizeConfig = "small" | "default" | "large";

export type ButtonConfig = ComponentStyleConfig & {
  classNames?: {
    variants?: Record<string, unknown>;
  };
  type?: ButtonTypeConfig;
  variant?: ButtonVariantConfig;
  color?: ButtonColorConfig;
  size?: ButtonSizeConfig;
};

export type DatePickerConfig = ComponentStyleConfig & {
  variant?: Variant;
  styles?: {
    root?: React.CSSProperties;
  };
  classNames?: {
    root?: string;
  };
  format?: string;
  captionLayout?: DatePickerCaptionLayout;
  commitYearOnClose?: boolean;
};

export type FormConfig = ComponentStyleConfig & {
  layout?: FormLayoutConfig;
  labelCol?: unknown;
  wrapperCol?: unknown;
  labelAlign?: FormLabelAlignConfig;
  labelWrap?: boolean;
  colon?: boolean;
};

export type InputConfig = ComponentStyleConfig & {
  autoComplete?: string;
  classNames?: SemanticClassNames;
  styles?: SemanticStyles;
  allowClear?: AllowClearConfig;
  variant?: Variant;
};

export type InputNumberConfig = ComponentStyleConfig & {
  variant?: Variant;
};

export type MentionsConfig = ComponentStyleConfig & {
  variant?: Variant;
};

export type SelectConfig = ComponentStyleConfig & {
  showSearch?: boolean;
  variant?: Variant;
  classNames?: SemanticClassNames & {
    popup?: SemanticClassNames;
  };
  styles?: SemanticStyles & {
    popup?: SemanticStyles;
  };
};

export type PaginationConfig = ComponentStyleConfig &
  Pick<PaginationProps, "showSizeChanger" | "itemRender" | "onShowSizeChange">;

export interface ResultStatusConfig {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
}

export interface ResultConfig extends ComponentStyleConfig {
  status?: {
    success?: ResultStatusConfig;
    info?: ResultStatusConfig;
    warning?: ResultStatusConfig;
    error?: ResultStatusConfig;
    "500"?: ResultStatusConfig;
    "404"?: ResultStatusConfig;
  };
}
export interface TableConfig extends ComponentStyleConfig {
  bordered?: TableProps["bordered"];
  expandable?: {
    expandIcon?: NonNullable<TableProps["expandable"]>["expandIcon"];
  };
}

export type TagConfig = ComponentStyleConfig & {
  variant?: TagVariantConfig;
  color?: TagColorConfig;
  size?: TagSizeConfig;
};

export type TextAreaConfig = ComponentStyleConfig & {
  autoComplete?: string;
  classNames?: SemanticClassNames;
  styles?: SemanticStyles;
  allowClear?: AllowClearConfig;
  variant?: Variant;
};

export interface PageContainerConfig {
  loadingRender?: React.ReactNode;
}

export interface LayoutConfig extends ComponentStyleConfig {
  pageContainer?: PageContainerConfig;
}

export type PopupOverflow = "viewport" | "scroll";

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
  avatar?: ComponentStyleConfig;
  checkbox?: ComponentStyleConfig;
  input?: InputConfig;
  inputNumber?: InputNumberConfig;
  mentions?: MentionsConfig;
  // space?: SpaceConfig;
  // splitter?: ComponentStyleConfig;
  form?: FormConfig;
  select?: SelectConfig;
  // alert?: AlertConfig;
  // anchor?: ComponentStyleConfig;
  button?: ButtonConfig;
  // divider?: ComponentStyleConfig;
  // drawer?: DrawerConfig;
  // calendar?: ComponentStyleConfig;
  // carousel?: ComponentStyleConfig;
  // cascader?: CascaderConfig;
  // treeSelect?: TreeSelectConfig;
  // collapse?: CollapseConfig;
  // floatButtonGroup?: FloatButtonGroupConfig;
  // typography?: ComponentStyleConfig;
  pagination?: PaginationConfig;
  skeleton?: ComponentStyleConfig;
  // spin?: SpinConfig;
  // segmented?: ComponentStyleConfig;
  // steps?: ComponentStyleConfig;
  // statistic?: ComponentStyleConfig;
  // image?: ImageConfig;
  layout?: LayoutConfig;
  // list?: ListConfig;
  // modal?: ModalConfig;
  progress?: ComponentStyleConfig;
  result?: ResultConfig;
  // slider?: SliderConfig;
  // slider?: SliderConfig;
  // breadcrumb?: ComponentStyleConfig;
  // menu?: MenuConfig;
  // descriptions?: DescriptionsConfig;
  // empty?: EmptyConfig;
  // badge?: BadgeConfig;
  // radio?: ComponentStyleConfig;
  // rate?: ComponentStyleConfig;
  // switch?: ComponentStyleConfig;
  // transfer?: TransferConfig;
  // message?: ComponentStyleConfig;
  tag?: TagConfig;
  table?: TableConfig;
  textArea?: TextAreaConfig;
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
  datePicker?: DatePickerConfig;
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

export const { Consumer: ConfigConsumer } = ConfigContext;

const EMPTY_OBJECT = {};

type GetClassNamesOrEmptyObject<Config extends { classNames?: any }> =
  Config extends {
    classNames?: infer ClassNames;
  }
    ? ClassNames
    : object;

type GetStylesOrEmptyObject<Config extends { styles?: any }> = Config extends {
  styles?: infer Styles;
}
  ? Styles
  : object;

type ComponentReturnType<T extends keyof ConfigComponentProps> = Omit<
  NonNullable<ConfigComponentProps[T]>,
  "classNames" | "styles"
> & {
  classNames: GetClassNamesOrEmptyObject<NonNullable<ConfigComponentProps[T]>>;
  styles: GetStylesOrEmptyObject<NonNullable<ConfigComponentProps[T]>>;
  direction: ConfigConsumerProps["direction"];
  getPopupContainer: ConfigConsumerProps["getPopupContainer"];
};

/**
 * Get ConfigProvider configured component props.
 * This help to reduce bundle size for saving `?.` operator.
 * Do not use as `useMemo` deps since we do not cache the object here.
 *
 * NOTE: not refactor this with `useMemo` since memo will cost another memory space,
 * which will waste both compare calculation & memory.
 */
export function useComponentConfig<T extends keyof ConfigComponentProps>(
  propName: T,
) {
  const context = React.useContext(ConfigContext);
  const { direction, getPopupContainer } = context;

  const propValue = context[propName];
  return {
    classNames: EMPTY_OBJECT,
    styles: EMPTY_OBJECT,
    ...propValue,
    direction,
    getPopupContainer,
  } as ComponentReturnType<T>;
}

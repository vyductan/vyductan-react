import React from "react";

import type { WarningContextProps } from "../_util/warning";
import type { ShowWaveEffect } from "../../lib/wave/interface";
import type { DatePickerProps } from "../date-picker";
import type { InputNumberProps, InputProps } from "../input";
import type { Locale } from "../locale";
import type { MentionsProps } from "../mentions";
import type { XorSelectProps } from "../select";
import type { TableProps } from "../table";
import type { TextAreaProps } from "../textarea";
import type {
  AliasToken,
  MappingAlgorithm,
  OverrideToken,
} from "../theme/interface";
import type { RenderEmptyHandler } from "./default-render-empty";

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

export type DatePickerConfig = ComponentStyleConfig &
  Pick<
    DatePickerProps,
    | "variant"
    | "styles"
    | "classNames"
    | "format"
    | "captionLayout"
    | "commitYearOnClose"
  >;

export type InputConfig = ComponentStyleConfig &
  Pick<
    InputProps,
    "autoComplete" | "classNames" | "styles" | "allowClear" | "variant"
  >;

export type InputNumberConfig = ComponentStyleConfig &
  Pick<InputNumberProps, "variant">;

export type MentionsConfig = ComponentStyleConfig &
  Pick<MentionsProps, "variant">;

export type SelectConfig = ComponentStyleConfig &
  Pick<XorSelectProps, "showSearch" | "variant" | "classNames" | "styles">;

export interface TableConfig extends ComponentStyleConfig {
  bordered?: TableProps["bordered"];
  expandable?: {
    expandIcon?: NonNullable<TableProps["expandable"]>["expandIcon"];
  };
}

export type TextAreaConfig = ComponentStyleConfig &
  Pick<
    TextAreaProps,
    "autoComplete" | "classNames" | "styles" | "allowClear" | "variant"
  >;

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
  // pagination?: PaginationConfig;
  // space?: SpaceConfig;
  // splitter?: ComponentStyleConfig;
  // form?: FormConfig;
  select?: SelectConfig;
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
  skeleton?: ComponentStyleConfig;
  // spin?: SpinConfig;
  // segmented?: ComponentStyleConfig;
  // steps?: ComponentStyleConfig;
  // statistic?: ComponentStyleConfig;
  // image?: ImageConfig;
  // layout?: ComponentStyleConfig;
  // list?: ListConfig;
  // modal?: ModalConfig;
  progress?: ComponentStyleConfig;
  // result?: ComponentStyleConfig;
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
  // tag?: TagConfig;
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

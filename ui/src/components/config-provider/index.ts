import type {
  InputConfig,
  InputNumberConfig,
  MentionsConfig,
  SelectConfig,
  TextAreaConfig,
} from "./context";

export { useUiConfig, UiConfigProvider } from "./config-provider";
export type { Variant } from "./context";
export { Variants } from "./context";
export { ConfigContext } from "./context";

export interface ConfigProviderProps {
  // getTargetContainer?: () => HTMLElement | Window;
  // getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  // prefixCls?: string;
  // iconPrefixCls?: string;
  // children?: React.ReactNode;
  // renderEmpty?: RenderEmptyHandler;
  // csp?: CSPConfig;
  // /** @deprecated Please use `{ button: { autoInsertSpace: boolean }}` instead */
  // autoInsertSpaceInButton?: boolean;
  // variant?: Variant;
  // form?: FormConfig;
  input?: InputConfig;
  inputNumber?: InputNumberConfig;
  textArea?: TextAreaConfig;
  // pagination?: PaginationConfig;
  // /**
  //  * @descEN Language package setting, you can find the packages in `antd/locale`.
  //  */
  // locale?: Locale;
  // componentSize?: SizeType;
  // componentDisabled?: boolean;
  // /**
  //  * @descEN Set direction of layout.
  //  * @default ltr
  //  */
  // direction?: DirectionType;
  // space?: SpaceConfig;
  // splitter?: ComponentStyleConfig;
  // /**
  //  * @descEN Close the virtual scrolling when setting `false`.
  //  * @default true
  //  */
  // virtual?: boolean;
  // /** @deprecated Please use `popupMatchSelectWidth` instead */
  // dropdownMatchSelectWidth?: boolean;
  // popupMatchSelectWidth?: boolean;
  // popupOverflow?: PopupOverflow;
  // theme?: ThemeConfig;
  // warning?: WarningContextProps;
  // avatar?: ComponentStyleConfig;
  // alert?: AlertConfig;
  // anchor?: ComponentStyleConfig;
  // button?: ButtonConfig;
  // breadcrumb?: ComponentStyleConfig;
  // calendar?: ComponentStyleConfig;
  // carousel?: ComponentStyleConfig;
  //   cascader?: CascaderConfig;
  // collapse?: CollapseConfig;
  // divider?: ComponentStyleConfig;
  // drawer?: DrawerConfig;
  // typography?: ComponentStyleConfig;
  // skeleton?: ComponentStyleConfig;
  // spin?: SpinConfig;
  // segmented?: ComponentStyleConfig;
  // statistic?: ComponentStyleConfig;
  // steps?: ComponentStyleConfig;
  // image?: ImageConfig;
  // layout?: ComponentStyleConfig;
  // list?: ListConfig;
  mentions?: MentionsConfig;
  // modal?: ModalConfig;
  // progress?: ComponentStyleConfig;
  // result?: ComponentStyleConfig;
  // slider?: ComponentStyleConfig;
  // menu?: MenuConfig;
  // floatButtonGroup?: FloatButtonGroupConfig;
  // checkbox?: ComponentStyleConfig;
  // descriptions?: ComponentStyleConfig;
  // empty?: EmptyConfig;
  // badge?: BadgeConfig;
  // radio?: ComponentStyleConfig;
  // rate?: ComponentStyleConfig;
  select?: SelectConfig;
  // switch?: ComponentStyleConfig;
  // transfer?: TransferConfig;
  // tree?: ComponentStyleConfig;
  // treeSelect?: TreeSelectConfig;
  // message?: ComponentStyleConfig;
  // tag?: TagConfig;
  // table?: TableConfig;
  // card?: CardConfig;
  // tabs?: TabsConfig;
  // timeline?: ComponentStyleConfig;
  // timePicker?: TimePickerConfig;
  // upload?: ComponentStyleConfig;
  // notification?: NotificationConfig;
  // colorPicker?: ComponentStyleConfig;
  // datePicker?: DatePickerConfig;
  // rangePicker?: RangePickerConfig;
  // dropdown?: ComponentStyleConfig;
  // flex?: FlexConfig;
  // /**
  //  * Wave is special component which only patch on the effect of component interaction.
  //  */
  // wave?: WaveConfig;
  // tour?: TourConfig;
  // tooltip?: TooltipConfig;
  // popover?: PopoverConfig;
  // popconfirm?: PopconfirmConfig;
}

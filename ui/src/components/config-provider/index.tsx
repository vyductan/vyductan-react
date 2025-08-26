import React from "react";
import useMemo from "rc-util/lib/hooks/useMemo";

import type {
  ConfigConsumerProps,
  DatePickerConfig,
  InputConfig,
  InputNumberConfig,
  MentionsConfig,
  SelectConfig,
  TextAreaConfig,
} from "./context";
import { ConfigContext } from "./context";

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
  datePicker?: DatePickerConfig;
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

interface ProviderChildrenProps extends ConfigProviderProps {
  parentContext: ConfigConsumerProps;
  children: React.ReactNode;
}

const ProviderChildren: React.FC<ProviderChildrenProps> = ({
  parentContext,
  children,

  datePicker,
}) => {
  // const context = React.useMemo(() => {
  //   return {
  //     ...parentContext,
  //     locale: legacyLocale,
  //   };
  // }, [parentContext, legacyLocale]);

  const baseConfig = {
    datePicker,
  };
  const config: ConfigConsumerProps = {
    ...parentContext,
  };

  for (const key of Object.keys(baseConfig) as (keyof typeof baseConfig)[]) {
    if (baseConfig[key] !== undefined) {
      (config as any)[key] = baseConfig[key];
    }
  }

  // https://github.com/ant-design/ant-design/issues/27617
  const memoedConfig = useMemo(
    () => config,
    config,
    (prevConfig, currentConfig) => {
      const prevKeys = Object.keys(prevConfig) as Array<keyof typeof config>;
      const currentKeys = Object.keys(currentConfig) as Array<
        keyof typeof config
      >;
      return (
        prevKeys.length !== currentKeys.length ||
        prevKeys.some((key) => prevConfig[key] !== currentConfig[key])
      );
    },
  );

  return (
    <ConfigContext.Provider value={memoedConfig}>
      {children}
    </ConfigContext.Provider>
  );
};

export const ConfigProvider: React.FC<
  ConfigProviderProps & { children: React.ReactNode }
> & {
  /** @private internal Usage. do not use in your production */
  // ConfigContext: typeof ConfigContext;
  /** @deprecated Please use `ConfigProvider.useConfig().componentSize` instead */
  // SizeContext: typeof SizeContext;
  // config: typeof setGlobalConfig;
  // useConfig: typeof useConfig;
} = (props) => {
  const context = React.useContext<ConfigConsumerProps>(ConfigContext);

  return <ProviderChildren parentContext={context} {...props} />;
};

// ConfigProvider.ConfigContext = ConfigContext;
// ConfigProvider.SizeContext = SizeContext;
// ConfigProvider.config = setGlobalConfig;
// ConfigProvider.useConfig = useConfig;

// Object.defineProperty(ConfigProvider, 'SizeContext', {
//   get: () => {
//     warning(
//       false,
//       'ConfigProvider',
//       'ConfigProvider.SizeContext is deprecated. Please use `ConfigProvider.useConfig().componentSize` instead.',
//     );
//     return SizeContext;
//   },
// });

import { theme, type GlobalToken } from "antd"
import defaultColors from "tailwindcss/colors"

const THEME_TOKEN = {
  ...theme.getDesignToken(),
  colorPrimary: defaultColors.blue[600],
  colorPrimaryBorder: defaultColors.blue[300],
  colorPrimaryHover: defaultColors.blue[500],
  // colorText: defaultColors.gray[600],
  colorTextDisabled: "#00000040",
  colorBorder: defaultColors.gray[200],
  colorBorderSecondary: defaultColors.gray[200],
  controlHeightSM: 32,
  controlHeight: 40,
  controlHeightLG: 48,
  colorError: defaultColors.red[500],
} satisfies GlobalToken

export default THEME_TOKEN

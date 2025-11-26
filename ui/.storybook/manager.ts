import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming";

const theme = create({
  base: "light",
  brandTitle: "Acme UI",
  brandUrl: "https://acme.com",
  brandTarget: "_self",
});

addons.setConfig({
  theme,
});

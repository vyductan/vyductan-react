import { describe, expectTypeOf, test } from "vitest";

import type { buttonColorVariants } from "../button";
import type { FormLayout } from "../form";
import type { tagVariants } from "../tag/tag";
import type { useComponentConfig } from "./context";

describe("ConfigProvider component config types", () => {
  test("button config color stays compatible with button variants", () => {
    type ButtonColor = ReturnType<typeof useComponentConfig<"button">>["color"];
    type ButtonVariant = ReturnType<
      typeof useComponentConfig<"button">
    >["variant"];
    type ButtonVariantProps = NonNullable<
      Parameters<typeof buttonColorVariants>[0]
    >;

    expectTypeOf<ButtonColor>().toMatchTypeOf<
      ButtonVariantProps["color"] | undefined
    >();
    expectTypeOf<ButtonVariant>().toMatchTypeOf<
      ButtonVariantProps["variant"] | undefined
    >();
  });

  test("form config layout stays compatible with form root layout", () => {
    type FormConfigLayout = ReturnType<
      typeof useComponentConfig<"form">
    >["layout"];

    expectTypeOf<FormConfigLayout>().toEqualTypeOf<FormLayout | undefined>();
  });

  test("tag config variants stay compatible with tag variants", () => {
    type TagVariant = ReturnType<typeof useComponentConfig<"tag">>["variant"];
    type TagColor = ReturnType<typeof useComponentConfig<"tag">>["color"];
    type TagSize = ReturnType<typeof useComponentConfig<"tag">>["size"];
    type TagVariantProps = NonNullable<Parameters<typeof tagVariants>[0]>;

    expectTypeOf<TagVariant>().toMatchTypeOf<
      TagVariantProps["variant"] | undefined
    >();
    expectTypeOf<TagColor>().toMatchTypeOf<
      TagVariantProps["color"] | undefined
    >();
    expectTypeOf<TagSize>().toMatchTypeOf<
      TagVariantProps["size"] | undefined
    >();
  });
});

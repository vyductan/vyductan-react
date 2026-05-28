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
    expectTypeOf<"default">().toMatchTypeOf<NonNullable<TagColor>>();
    expectTypeOf<"default">().toMatchTypeOf<
      NonNullable<TagVariantProps["color"]>
    >();
    expectTypeOf<"#108ee9">().toMatchTypeOf<NonNullable<TagColor>>();
    expectTypeOf<TagSize>().toMatchTypeOf<
      TagVariantProps["size"] | undefined
    >();
  });

  test("tag config only exposes AntD-style colorful variants", () => {
    type TagVariant = ReturnType<typeof useComponentConfig<"tag">>["variant"];
    type TagVariantProps = NonNullable<Parameters<typeof tagVariants>[0]>;
    type ExpectedTagVariant = "filled" | "solid" | "outlined";

    expectTypeOf<NonNullable<TagVariant>>().toEqualTypeOf<ExpectedTagVariant>();
    expectTypeOf<
      NonNullable<TagVariantProps["variant"]>
    >().toEqualTypeOf<ExpectedTagVariant>();
  });

  test("tag config accepts preset colors and arbitrary strings", () => {
    type TagColor = ReturnType<typeof useComponentConfig<"tag">>["color"];
    type TagVariantProps = NonNullable<Parameters<typeof tagVariants>[0]>;

    expectTypeOf<"slate">().toMatchTypeOf<NonNullable<TagColor>>();
    expectTypeOf<"geekblue">().toMatchTypeOf<NonNullable<TagColor>>();
    expectTypeOf<"unknown-brand">().toMatchTypeOf<NonNullable<TagColor>>();
    expectTypeOf<"slate">().toMatchTypeOf<
      NonNullable<TagVariantProps["color"]>
    >();
    expectTypeOf<"geekblue">().toMatchTypeOf<
      NonNullable<TagVariantProps["color"]>
    >();
  });
});

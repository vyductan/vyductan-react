"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { clsm } from "@acme/ui";

import { CircleFilled } from "../icons";
import { Label } from "../label";

type RadioOption<TValue extends string = string> = {
  label: React.ReactNode;
  value: TValue;
  disabled?: boolean;
};
type RadioGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
  "defaultValue" | "onChange"
> & {
  defaultValue?: HTMLInputElement["defaultValue"];
  options: RadioOption[];
  onChange?: RadioGroupPrimitive.RadioGroupProps["onValueChange"];
};
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, options, onChange, ...props }, ref) => {
  return (
    <>
      <RadioGroupPrimitive.Root
        className={clsm("flex gap-2", className)}
        onValueChange={onChange}
        {...props}
        ref={ref}
      >
        {options.map((option, index) => (
          <Radio key={index} {...option} />
        ))}
      </RadioGroupPrimitive.Root>
    </>
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

type RadioProps = React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> & {
  label?: React.ReactNode;
};
const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(({ label, className, ...props }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <RadioGroupPrimitive.Item
        id={id}
        ref={ref}
        className={clsm(
          "aspect-square size-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:border-2",
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <CircleFilled className="size-2 fill-current text-current" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      <Label htmlFor={id} className="cursor-pointer px-2">
        {label}
      </Label>
    </div>
  );
});
Radio.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, Radio };
export type { RadioGroupProps, RadioOption };

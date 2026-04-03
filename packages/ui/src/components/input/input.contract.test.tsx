import type * as React from "react";
import { test } from "vitest";

import type { InputProps } from ".";
import { Input } from ".";

test("Input type number keeps DOM input onChange contract", () => {
  Input({
    type: "number",
    value: 1,
    onChange: (event) => {
      const domEvent: React.ChangeEvent<HTMLInputElement> = event;
      const nextValue: string = event.target.value;
      void domEvent;
      void nextValue;

      // @ts-expect-error Input type=number should not expose InputNumber numeric callback values
      const numericValue: number | null = event;
      void numericValue;
    },
  });
});

test("Input does not accept type time", () => {
  Input({
    // @ts-expect-error use TimePicker directly instead of Input type=time
    type: "time",
  });
});

test("Input props type does not allow type time", () => {
  const props: InputProps = {
    // @ts-expect-error public InputProps should reject type=time
    type: "time",
  };

  void props;
});

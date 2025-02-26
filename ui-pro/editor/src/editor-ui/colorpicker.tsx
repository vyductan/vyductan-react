/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from "react";
import { HexColorPicker } from "react-colorful";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "@acme/ui/popover";

type Props = {
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  title?: string;
  stopCloseOnClickSelf?: boolean;
  color: string;
  onChange?: (color: string, skipHistoryStack: boolean) => void;
};

export default function ColorPicker({
  disabled = false,
  // stopCloseOnClickSelf = true,
  color,
  onChange,
  icon,
  // label,
  ...rest
}: Props) {
  return (
    <PopoverRoot modal={true}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button size={"sm"} variant={"outline"} className="h-8 w-8" {...rest}>
          <span className="size-4 rounded-full">{icon}</span>
          {/* <ChevronDownIcon className='size-4'/> */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <HexColorPicker
          color={color}
          onChange={(color) => onChange?.(color, false)}
        />
        <Input
          maxLength={7}
          onChange={(e) => {
            e.stopPropagation();
            onChange?.(e.currentTarget.value, false);
          }}
          value={color}
        />
      </PopoverContent>
    </PopoverRoot>
  );
}

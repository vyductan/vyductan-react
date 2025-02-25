/* eslint-disable unicorn/no-null */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { JSX } from "react";
import * as React from "react";
import { useCallback, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ErrorBoundary } from "react-error-boundary";

import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";

import KatexRenderer from "../editor-ui/katex-renderer";

type Props = {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
};

export default function KatexEquationAlterer({
  onConfirm,
  initialEquation = "",
}: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <>
      <div className="flex items-center space-x-2">
        <Label htmlFor="inline-toggle" className="text-sm font-medium">
          Inline
        </Label>
        <Checkbox
          id="inline-toggle"
          checked={inline}
          onChange={onCheckboxChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="equation-input" className="text-sm font-medium">
          Equation
        </Label>
        {inline ? (
          <Input
            id="equation-input"
            onChange={(event) => setEquation(event.target.value)}
            value={equation}
            placeholder="Enter inline equation..."
          />
        ) : (
          <Textarea
            id="equation-input"
            onChange={(event) => setEquation(event.target.value)}
            value={equation}
            placeholder="Enter block equation..."
            className="min-h-[100px]"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Visualization</Label>
        <div className="bg-muted rounded-md border p-4">
          <ErrorBoundary onError={(e) => editor._onError(e)} fallback={null}>
            <KatexRenderer
              equation={equation}
              inline={false}
              onDoubleClick={() => null}
            />
          </ErrorBoundary>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onClick}>Confirm</Button>
      </div>
    </>
  );
}

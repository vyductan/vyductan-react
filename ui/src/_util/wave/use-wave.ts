/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import * as React from "react";
import { useEvent } from "@rc-component/util";
import raf from "@rc-component/util/lib/raf";

import type { ShowWave, WaveComponent } from "./interface";
import { useUiConfig } from "../../store";
import { TARGET_CLS } from "./interface";
import showWaveEffect from "./wave-effect";

const useWave = (
  nodeRef: React.RefObject<HTMLElement | null>,
  className: string,
  component?: WaveComponent,
) => {
  const { wave } = useUiConfig((s) => s.components);

  const showWave = useEvent<ShowWave>((event) => {
    const node = nodeRef.current!;

    if (wave?.disabled || !node) {
      return;
    }

    const targetNode =
      node.querySelector<HTMLElement>(`.${TARGET_CLS}`) ?? node;

    const { showEffect } = wave ?? {};

    // Customize wave effect
    (showEffect ?? showWaveEffect)(targetNode, {
      className,
      component,
      event,
    });
  });

  const rafId = React.useRef<number>(null);

  // Merge trigger event into one for each frame
  const showDebounceWave: ShowWave = (event) => {
    raf.cancel(rafId.current!);

    rafId.current = raf(() => {
      showWave(event);
    });
  };

  return showDebounceWave;
};

export default useWave;

import * as React from "react";
import { useEvent } from "rc-util";
import raf from "rc-util/lib/raf";

import type { ShowWave, WaveAllowedComponent } from "./interface";
import showWaveEffect from "./WaveEffect";

export default function useWave(
  nodeRef: React.RefObject<HTMLElement>,
  className: string,
  component?: WaveAllowedComponent,
) {
  const showWave = useEvent<ShowWave>((event) => {
    const node = nodeRef.current!;

    if (!node) {
      return;
    }

    const targetNode = node;

    // Customize wave effect
    showWaveEffect(targetNode, {
      className,
      component,
      event,
    });
  });

  const rafId = React.useRef<number>();

  // Merge trigger event into one for each frame
  const showDebounceWave: ShowWave = (event) => {
    raf.cancel(rafId.current!);

    rafId.current = raf(() => {
      showWave(event);
    });
  };

  return showDebounceWave;
}

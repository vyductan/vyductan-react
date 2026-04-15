import { useEffect, useRef } from "react";
import raf from "@rc-component/util/es/raf";

/**
 * Always trigger latest once when call multiple time
 */
const useFrame = () => {
  const idReference = useRef(0);

  const cleanUp = () => {
    raf.cancel(idReference.current);
  };

  useEffect(() => cleanUp, []);

  return (callback: () => void) => {
    cleanUp();

    idReference.current = raf(() => {
      callback();
    });
  };
};
export default useFrame;

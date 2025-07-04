import { useRef } from "react";
import useLayoutEffect from "rc-util/lib/hooks/useLayoutEffect";

import type { ScreenMap } from "../../_util/responsive-observer";
import useForceUpdate from "../../_util/hooks/use-force-update";
import useResponsiveObserver from "../../_util/responsive-observer";

function useBreakpoint(
  refreshOnChange: boolean,
  defaultScreens: null,
): ScreenMap | null;
function useBreakpoint(
  refreshOnChange?: boolean,
  defaultScreens?: ScreenMap,
): ScreenMap;

function useBreakpoint(
  refreshOnChange = true,
  defaultScreens: ScreenMap | null = {} as ScreenMap,
): ScreenMap | null {
  const screensRef = useRef<ScreenMap | null>(defaultScreens);
  const forceUpdate = useForceUpdate();
  const responsiveObserver = useResponsiveObserver();

  useLayoutEffect(() => {
    const token = responsiveObserver.subscribe((supportScreens) => {
      screensRef.current = supportScreens;
      if (refreshOnChange) {
        forceUpdate();
      }
    });

    return () => responsiveObserver.unsubscribe(token);
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return screensRef.current;
}

export default useBreakpoint;
// const responsiveMap = {
//   xs: '(max-width: 575px)',
//   sm: '(min-width: 576px)',
//   md: '(min-width: 768px)',
//   lg: '(min-width: 992px)',
//   xl: '(min-width: 1200px)',
//   xxl: '(min-width: 1600px)',
// } as const;

// type Breakpoint = keyof typeof responsiveMap;
// type BreakpointMap = Record<Breakpoint, boolean>;

// const useInternalBreakpoint = (): BreakpointMap => {
//   const [screens, setScreens] = useState<BreakpointMap>({
//     xs: false,
//     sm: false,
//     md: false,
//     lg: false,
//     xl: false,
//     xxl: false,
//   });

//   const getMatch = useCallback(
//     (breakpoint: Breakpoint): boolean => {
//       if (typeof window === 'undefined') {
//         return false;
//       }
//       const mediaQuery = window.matchMedia(responsiveMap[breakpoint]);
//       return mediaQuery.matches;
//     },
//     []
//   );

//   useEffect(() => {
//     const updateBreakpoints = () => {
//       const newScreens: BreakpointMap = {} as BreakpointMap;
//       let breakpointChecked: Breakpoint;

//       for (breakpointChecked in responsiveMap) {
//         newScreens[breakpointChecked] = getMatch(breakpointChecked);
//       }
//       setScreens(newScreens);
//     };

//     updateBreakpoints();
//     window.addEventListener('resize', updateBreakpoints);
//     return () => window.removeEventListener('resize', updateBreakpoints);
//   }, [getMatch]);

//   return screens;
// };

// export default useInternalBreakpoint;

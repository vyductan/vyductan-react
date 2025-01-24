import { useLocation } from "@tanstack/react-router";

export const usePathname = () => {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  return pathname;
};

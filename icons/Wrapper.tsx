import { cloneElement, HTMLAttributes, ReactElement, ReactNode } from "react"

import { clsm } from "@vyductan/utils"

export type IconWrapperProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  children: ReactElement
}
const IconWrapper = ({
  children,
  className = "",
  ...props
}: IconWrapperProps) => {
  return (
    <span role="img" className={clsm("h-6 w-6", className)} {...props}>
      {cloneElement(children, {
        "aria-hidden": "true",
      })}
    </span>
  )
}

export default IconWrapper

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import * as React from "react";

import type { AnyObject } from "../../_util/type";
import type { TableLocale } from "../types";
import { Icon } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Button } from "../../button";

interface DefaultExpandIconProps<RecordType = AnyObject> {
  record: RecordType;
  expanded: boolean;
  expandable: boolean;
  onExpand: (
    record: RecordType,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
}

function renderExpandIcon(locale: TableLocale) {
  return <RecordType extends AnyObject = AnyObject>(
    props: DefaultExpandIconProps<RecordType>,
  ) => {
    const { onExpand, record, expanded, expandable } = props;
    const iconPrefix = `row-expand-icon`;
    
    // Don't render expand icon for non-expandable rows
    if (!expandable) {
      return <span className={`${iconPrefix} ${iconPrefix}-spaced`} />;
    }
    
    return (
      <Button
        variant="text"
        size="small"
        onClick={(e) => {
          onExpand(record, e!);
          e.stopPropagation();
        }}
        className={cn(iconPrefix, {
          [`${iconPrefix}-expanded`]: expanded,
          [`${iconPrefix}-collapsed`]: !expanded,
        })}
        aria-label={expanded ? locale.collapse : locale.expand}
        aria-expanded={expanded}
        icon={
          expanded ? (
            <Icon icon="icon-[lucide--chevron-down]" />
          ) : (
            <Icon icon="icon-[lucide--chevron-right]" />
          )
        }
      />
    );
  };
}

export default renderExpandIcon;

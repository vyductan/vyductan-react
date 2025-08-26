import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";

// Unified TreeTitle component for both leaf and parent nodes
interface TreeTitleProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLSpanElement>;
  style?: React.CSSProperties;
  showIcon?: boolean;
}

function TreeTitle({
  title,
  icon,
  isSelected,
  isDisabled,
  onClick,
  style,
  showIcon,
}: TreeTitleProps) {
  return (
    <Button
      type="text"
      tabIndex={0}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 truncate rounded px-2 py-1 pl-1 text-sm font-normal transition outline-none",
        "justify-start",
        isSelected && "bg-accent text-accent-foreground",
        isDisabled && "cursor-not-allowed opacity-50",
        !isDisabled && "hover:bg-accent hover:text-accent-foreground",
      )}
      style={style}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      data-slot="tree-node-content"
    >
      {showIcon && icon && (
        <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
      )}
      <span className="truncate">{title}</span>
    </Button>
  );
}

/** Provide a wrap type define for developer to wrap with customize fieldNames data type */
export type FieldDataNode<
  T,
  ChildFieldName extends string = "children",
> = BasicDataNode &
  T &
  Partial<Record<ChildFieldName, FieldDataNode<T, ChildFieldName>[]>>;
export type Key = React.Key;
export type DataNode = FieldDataNode<{
  key: Key;
  title?: React.ReactNode | ((data: DataNode) => React.ReactNode);
}>;
export interface TreeNodeProps<TreeDataType extends BasicDataNode = DataNode> {
  eventKey?: Key;
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  loaded?: boolean;
  loading?: boolean;
  halfChecked?: boolean;
  title?: React.ReactNode | ((data: TreeDataType) => React.ReactNode);
  dragOver?: boolean;
  dragOverGapTop?: boolean;
  dragOverGapBottom?: boolean;
  pos?: string;
  domRef?: React.Ref<HTMLDivElement>;
  /** New added in Tree for easy data access */
  data?: TreeDataType;
  isStart?: boolean[];
  isEnd?: boolean[];
  active?: boolean;
  onMouseMove?: React.MouseEventHandler<HTMLDivElement>;
  isLeaf?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  icon?: IconType;
  switcherIcon?: IconType;
  children?: React.ReactNode;
}
export type IconType =
  | React.ReactNode
  | ((props: TreeNodeProps) => React.ReactNode);

/** For fieldNames, we provides a abstract interface */
export interface BasicDataNode {
  checkable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  icon?: IconType;
  isLeaf?: boolean;
  selectable?: boolean;
  switcherIcon?: IconType;
  /** Set style of TreeNode. This is not recommend if you don't have any force requirement */
  className?: string;
  style?: React.CSSProperties;
}

type TreeProps<TreeDataType extends BasicDataNode = DataNode> = {
  /** The treeNodes data Array, if set it then you need not to construct children TreeNode. (key should be unique across the whole array) */
  treeData?: TreeDataType[];
  /** Tree node data */
  children?: React.ReactNode;
  /** Default expanded keys */
  defaultExpandedKeys?: Key[];
  /** Expanded keys (controlled) */
  expandedKeys?: Key[];
  /** Callback function for when a tree node is expanded/collapsed */
  onExpand?: (
    expandedKeys: Key[],
    info: { expanded: boolean; node: TreeDataType },
  ) => void;
  /** Callback function for when a tree node is selected */
  onSelect?: (
    selectedKeys: Key[],
    info: { selected: boolean; node: TreeDataType },
  ) => void;
  /** Selected keys */
  selectedKeys?: Key[];
  /** Whether to show the connecting line */
  showLine?: boolean;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Custom icon */
  icon?: IconType;
  /** Custom switcher icon */
  switcherIcon?: IconType;

  className?: string;
};

type TreeNodeData = {
  key: Key;
  title: React.ReactNode;
  children?: TreeNodeData[];
  icon?: React.ReactNode;
  isLeaf?: boolean;
  disabled?: boolean;
};

type InternalTreeProps = TreeProps & {
  /** Internal prop for recursive rendering */
  item?: TreeNodeData;
  /** Internal prop for tracking depth level */
  depth?: number;
  /** Internal prop for tracking if this is the last child */
  isLast?: boolean;
  /** Internal prop for tracking parent line states */
  parentLines?: boolean[];
  _parent?: {
    depth: number;
    isLast: boolean;
  };
};

function Tree(props: InternalTreeProps) {
  const {
    treeData,
    item,
    children,
    selectedKeys,
    onSelect,
    depth = 0,
    isLast = false,
    parentLines = [],
    className,
    ...restProps
  } = props;

  // If treeData is provided, render the tree structure
  if (treeData && treeData.length > 0) {
    return (
      <div className={cn("tree-root", depth === 0 ? className : undefined)}>
        {treeData.map((node, index) => (
          <TreeNode
            key={node.key}
            item={node as TreeNodeData}
            selectedKeys={selectedKeys}
            onSelect={onSelect}
            depth={depth}
            isLast={index === treeData.length - 1}
            parentLines={parentLines}
            {...restProps}
          />
        ))}
      </div>
    );
  }

  // If item is provided (internal recursive call), render single node
  if (item) {
    return (
      <TreeNode
        item={item}
        selectedKeys={selectedKeys}
        onSelect={onSelect}
        depth={depth}
        isLast={isLast}
        parentLines={parentLines}
        {...restProps}
      />
    );
  }

  // Fallback to children
  return <div className="tree-root">{children}</div>;
}

function TreeNode({
  item,
  selectedKeys,
  onSelect,
  depth = 0,
  isLast = false,
  parentLines = [],
  showIcon = false,
  showLine = false,
  _parent,
  ...props
}: {
  item: TreeNodeData;
  selectedKeys?: Key[];
  onSelect?: TreeProps["onSelect"];
  depth?: number;
  isLast?: boolean;
  parentLines?: boolean[];
  _parent?: {
    depth: number;
    isLast: boolean;
  };
  showLine?: boolean;
} & Omit<TreeProps, "selectedKeys" | "onSelect" | "showLine">) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedKeys?.includes(item.key);

  const handleClick = () => {
    if (onSelect) {
      const newSelectedKeys = isSelected
        ? (selectedKeys?.filter((key) => key !== item.key) ?? [])
        : // : [...(selectedKeys || []), item.key];
          [item.key];
      onSelect(newSelectedKeys, { selected: !isSelected, node: item as any });
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Add additional margin for nodes with lines to prevent text overlap
  const nodeContentStyle: React.CSSProperties =
    showLine && depth > 0
      ? {
          marginLeft: "6px", // Add margin to account for the horizontal line
        }
      : {};

  if (!hasChildren) {
    return (
      <div
        className="tree-node relative flex h-8 items-center"
        role="treeitem"
        data-slot="tree-leaf-node"
        data-title={item.title}
        data-depth={depth}
        data-is-last={isLast}
      >
        {/* Indent */}
        <span
          className="inline-flex"
          aria-hidden="true"
          data-slot="tree-indent"
        >
          {Array.from({ length: depth }).map((_, i) => (
            <span
              key={i}
              className="relative inline-block h-8 w-6"
              data-slot="tree-indent-unit"
              data-indent-level={i}
            >
              {/* {_parent?.depth}.{i} */}
              <span
                className={cn(
                  "absolute top-0 left-1/2 h-full w-px",
                  _parent?.isLast && _parent.depth === i ? "hidden" : "",
                )}
                style={{
                  background: "#d9d9d9",
                  transform: "translateX(-50%)",
                }}
                data-slot="tree-indent-vertical"
              />
            </span>
          ))}
        </span>
        {/* Switcher (noop for leaf, with leaf-line) */}
        <span
          className="relative flex h-full w-6 flex-shrink-0 items-center justify-center"
          data-slot="switcher-leaf-noop"
          data-depth={depth}
        >
          {showLine && (
            <span
              data-slot="switcher-leaf-line"
              className="absolute inset-0 block"
            >
              {/* Horizontal line */}
              <span
                className={cn("absolute top-1/2 left-1/2", "w-1/2")}
                style={{
                  // width: "20px",
                  height: "1px",
                  background: "#d9d9d9",
                  transform: "translateY(-50%)",
                  zIndex: 2,
                }}
              />
              {/* Vertical line */}
              <span
                className={cn(
                  "absolute left-1/2",
                  "h-full",
                  isLast && "h-[calc(100%/2)]",
                )}
                style={{
                  width: "1px",
                  // height: "24px",
                  background: "#d9d9d9",
                  top: 0,
                  transform: "translateX(-50%)",
                  zIndex: 2,
                }}
              />
            </span>
          )}
        </span>
        {/* Content */}
        <TreeTitle
          title={item.title}
          isSelected={isSelected}
          isDisabled={item.disabled}
          onClick={handleClick}
          icon={item.icon}
          showIcon={showIcon}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "tree-node relative",
        // isLast && '[&_span[data-slot="tree-indent-vertical"]]:hidden',
      )}
      data-indent-level
      data-slot="tree-parent-node"
      data-title={item.title}
      data-depth={depth}
      data-is-last={isLast}
      data-expanded={isExpanded}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="relative z-10 flex h-8 items-center">
          {/* Indent */}
          <span
            className="inline-flex"
            aria-hidden="true"
            data-slot="tree-indent"
          >
            {Array.from({ length: depth }).map((_, i) => (
              <span
                key={i}
                className="relative inline-block h-8 w-6"
                data-slot="tree-indent-unit"
                data-indent-level={i}
              >
                <span
                  className="absolute top-0 left-1/2 h-full w-px"
                  style={{
                    background: "#d9d9d9",
                    transform: "translateX(-50%)",
                  }}
                  data-slot="tree-indent-vertical"
                />
              </span>
            ))}
          </span>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-accent h-6 w-6 flex-shrink-0 p-0"
              onClick={handleToggle}
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-90",
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <TreeTitle
            title={item.title}
            icon={item.icon}
            isSelected={isSelected}
            isDisabled={item.disabled}
            onClick={handleClick}
            style={nodeContentStyle}
            showIcon={showIcon}
          />
          {/* Horizontal connector line from parent title to child title */}
          {/* {showLine &&
            Array.isArray(item.children) &&
            item.children.length > 0 && (
              <div
                className="absolute"
                data-slot="horizontal-parent-connector"
                style={{
                  left: `${48 + depth * 24}px`, // 24px (indent) + 24px (expand+gap+icon)
                  top: "50%",
                  width: "24px", // distance to next level indent
                  height: "1px",
                  background: "#d9d9d9",
                  transform: "translateY(-50%)",
                  zIndex: 1,
                }}
              />
            )} */}
        </div>
        <CollapsibleContent>
          <div>
            {item.children?.map((subItem, index) => {
              const childCount = item.children ? item.children.length : 0;
              const newParentLines = parentLines.slice(0, depth);
              newParentLines[depth] = index !== childCount - 1;

              return (
                <Tree
                  key={subItem.key}
                  item={subItem}
                  selectedKeys={selectedKeys}
                  onSelect={onSelect}
                  depth={depth + 1}
                  isLast={index === childCount - 1}
                  parentLines={newParentLines}
                  _parent={{
                    depth,
                    isLast,
                  }}
                  showLine={showLine}
                  showIcon={showIcon}
                  {...props}
                />
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export { Tree };

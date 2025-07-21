import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../collapsible";

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
    ...restProps
  } = props;

  // If treeData is provided, render the tree structure
  if (treeData && treeData.length > 0) {
    return (
      <div className="tree-root space-y-1">
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
  showLine = false,
  ...props
}: {
  item: TreeNodeData;
  selectedKeys?: Key[];
  onSelect?: TreeProps["onSelect"];
  depth?: number;
  isLast?: boolean;
  parentLines?: boolean[];
  showLine?: boolean;
} & Omit<TreeProps, "selectedKeys" | "onSelect" | "showLine">) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!item) return null;

  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedKeys?.includes(item.key);

  const handleClick = () => {
    if (onSelect) {
      const newSelectedKeys = isSelected
        ? selectedKeys?.filter((key) => key !== item.key) || []
        : [...(selectedKeys || []), item.key];
      onSelect(newSelectedKeys, { selected: !isSelected, node: item as any });
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const indentationStyle = {
    paddingLeft: `${depth * 24}px`,
  };

  // Generate connecting lines (Focus on expand icon lines first)
  const renderConnectingLines = () => {
    if (!showLine || depth === 0) return null;

    const lines = [];
    const expandIconOffset = 11; // Center of expand icon position
    const nodeHeight = 32;
    const nodeCenter = nodeHeight / 2;

    // Vertical lines connecting expand icons (SOLID)
    for (let i = 0; i < depth; i++) {
      // Show line if:
      // 1. For parent levels (i < depth - 1): check if parent has more siblings
      // 2. For current level (i === depth - 1): always show unless it's the very last node in tree
      const shouldShowExpandLine = i < depth - 1 ? parentLines[i] : true; // Always show for current level

      if (shouldShowExpandLine) {
        lines.push(
          <div
            key={`expand-line-${i}`}
            className="absolute"
            data-slot="expand-line"
            data-depth={depth}
            data-level={i}
            data-is-last={isLast}
            data-parent-line={i < depth - 1 ? parentLines[i] : 'current'}
            style={{
              left: `${i * 24 + expandIconOffset}px`,
              top: 0,
              height: "100%", // Always full height to prevent broken lines
              width: "1px",
              borderLeft: "1px solid #d9d9d9",
            }}
          />,
        );
      }
    }

    return (
      <div 
        className="pointer-events-none absolute inset-0 z-0" 
        data-slot="tree-lines-container"
        data-depth={depth}
        data-node-title={item.title}
        data-is-last={isLast}
      >
        {lines}
      </div>
    );
  };

  if (!hasChildren) {
    return (
      <div 
        className="tree-node relative h-8" 
        data-slot="tree-leaf-node"
        data-title={item.title}
        data-depth={depth}
        data-is-last={isLast}
      >
        {renderConnectingLines()}
        <div
          className="relative z-10 flex items-center"
          style={indentationStyle}
        >
          {/* Invisible spacer to align with expand icon */}
          <div className="h-6 w-6 flex-shrink-0" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "ml-1 h-8 flex-1 justify-start px-2 py-1 font-normal",
              "hover:bg-accent hover:text-accent-foreground",
              isSelected && "bg-accent text-accent-foreground",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
            disabled={item.disabled}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2">
              {item.icon && (
                <div className="flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </div>
              )}
              <span className="truncate">{item.title}</span>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="tree-node relative" 
      data-slot="tree-parent-node"
      data-title={item.title}
      data-depth={depth}
      data-is-last={isLast}
      data-expanded={isExpanded}
    >
      {renderConnectingLines()}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div
          className="relative z-10 flex h-8 items-center"
          style={indentationStyle}
        >
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
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "ml-1 h-8 flex-1 justify-start px-2 py-1 font-normal",
              "hover:bg-accent hover:text-accent-foreground",
              isSelected && "bg-accent text-accent-foreground",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
            disabled={item.disabled}
            onClick={handleClick}
          >
            <div className="flex items-center gap-2">
              {item.icon && (
                <div className="flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </div>
              )}
              <span className="truncate">{item.title}</span>
            </div>
          </Button>
        </div>
        <CollapsibleContent>
          <div className="mt-1">
            {item.children?.map((subItem, index) => {
              const newParentLines = [...parentLines];
              // Add current level to parent lines tracking
              newParentLines[depth] = !isLast;

              return (
                <Tree
                  key={subItem.key}
                  item={subItem}
                  selectedKeys={selectedKeys}
                  onSelect={onSelect}
                  depth={depth + 1}
                  isLast={index === (item.children?.length || 0) - 1}
                  parentLines={newParentLines}
                  showLine={showLine}
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

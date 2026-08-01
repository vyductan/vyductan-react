import type { JSX } from "react";
import { useEffect, useRef } from "react";

export interface ImageContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onReplace: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onCaption: () => void;
  onDelete: () => void;
  onClose: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  onClick: () => void;
  shortcut?: string;
  variant?: "default" | "danger";
}

export function ImageContextMenu({
  isOpen,
  position,
  onReplace,
  onCopy,
  onDownload,
  onCaption,
  onDelete,
  onClose,
}: ImageContextMenuProps): JSX.Element | null {
  const menuReference = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuReference.current &&
        !menuReference.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems: MenuItem[] = [
    {
      icon: "icon-[lucide--replace]",
      label: "Replace",
      onClick: () => {
        onReplace();
        onClose();
      },
    },
    {
      icon: "icon-[lucide--copy]",
      label: "Copy image",
      onClick: () => {
        onCopy();
        onClose();
      },
    },
    {
      icon: "icon-[lucide--download]",
      label: "Download",
      onClick: () => {
        onDownload();
        onClose();
      },
    },
    {
      icon: "icon-[lucide--message-square]",
      label: "Caption",
      onClick: () => {
        onCaption();
        onClose();
      },
      shortcut: "⌘⇧M",
    },
    {
      icon: "icon-[lucide--trash-2]",
      label: "Delete",
      onClick: () => {
        onDelete();
        onClose();
      },
      shortcut: "Del",
      variant: "danger",
    },
  ];

  return (
    <div
      ref={menuReference}
      className="border-border bg-popover text-popover-foreground fixed z-50 min-w-[220px] rounded-lg border shadow-lg"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div className="py-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={item.onClick}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
              item.variant === "danger"
                ? "text-red-600 hover:bg-red-50"
                : "text-popover-foreground hover:bg-accent"
            }`}
          >
            <span className={`${item.icon} size-4 shrink-0`} />
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-muted-foreground text-xs">
                {item.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

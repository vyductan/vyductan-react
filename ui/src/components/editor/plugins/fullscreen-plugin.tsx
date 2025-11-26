/**
 * Fullscreen Plugin
 * 
 * Plugin để toggle fullscreen mode cho editor
 * - Toggle fullscreen on/off
 * - Keyboard shortcut: F11 hoặc Cmd/Ctrl+Shift+F
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  KEY_MODIFIER_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { mergeRegister } from "@lexical/utils";

export function FullscreenPlugin({
  containerRef,
}: {
  containerRef?: React.RefObject<HTMLDivElement | null>;
} = {}) {
  const [editor] = useLexicalComposerContext();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      // If exiting fullscreen, restore styles
      if (!isNowFullscreen) {
        const rootElement = editor.getRootElement();
        if (rootElement) {
          let container: HTMLElement | null = null;
          if (containerRef?.current) {
            container = containerRef.current;
          } else {
            container = rootElement.closest(".group.rounded-xl.bg-white") as HTMLElement;
            if (!container) {
              container = rootElement.closest(".rounded-xl.bg-white") as HTMLElement;
            }
            if (!container) {
              container = rootElement.closest(".editor-scroll-container")?.parentElement as HTMLElement;
            }
            if (!container) {
              container = rootElement.closest(".relative") as HTMLElement;
            }
            if (!container) {
              container = rootElement.parentElement;
            }
          }

          if (container && container.dataset.originalStyles) {
            const styles = JSON.parse(container.dataset.originalStyles);
            Object.assign(container.style, styles);
            delete container.dataset.originalStyles;

            // Restore editor scroll container background
            const editorScrollContainer = container.querySelector(".editor-scroll-container") as HTMLElement;
            if (editorScrollContainer) {
              editorScrollContainer.style.backgroundColor = "";
            }
          }
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [editor, containerRef]);

  const toggleFullscreen = useCallback(async () => {
    // Use containerRef if provided, otherwise find from editor root
    let container: HTMLElement | null = null;

    if (containerRef?.current) {
      container = containerRef.current;
    } else {
      const rootElement = editor.getRootElement();
      if (rootElement) {
        // Try to find the Post Content container (the one with "group rounded-xl bg-white p-6")
        // This is the container that includes label, stats, and editor
        container = rootElement.closest(".group.rounded-xl.bg-white") as HTMLElement;
        // If not found, try to find the outer editor wrapper (the one with bg-white, rounded-xl)
        if (!container) {
          container = rootElement.closest(".rounded-xl.bg-white") as HTMLElement;
        }
        // If not found, try to find the editor-scroll-container parent
        if (!container) {
          container = rootElement.closest(".editor-scroll-container")?.parentElement as HTMLElement;
        }
        // If still not found, try to find parent with relative class
        if (!container) {
          container = rootElement.closest(".relative") as HTMLElement;
        }
        // Last resort: use parent element
        if (!container) {
          container = rootElement.parentElement;
        }
      }
    }

    if (!container) {
      console.warn("FullscreenPlugin: Could not find container element");
      return;
    }

    try {
      if (!document.fullscreenElement) {
        // Store original styles to restore later
        const originalStyles = {
          backgroundColor: container.style.backgroundColor,
          width: container.style.width,
          height: container.style.height,
          margin: container.style.margin,
          borderRadius: container.style.borderRadius,
        };
        container.dataset.originalStyles = JSON.stringify(originalStyles);

        // Add fullscreen styling before entering fullscreen
        container.style.backgroundColor = "white";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.margin = "0";
        container.style.borderRadius = "0";
        container.style.padding = "1rem";
        container.style.overflow = "auto";

        // Also ensure editor content has white background
        const editorScrollContainer = container.querySelector(".editor-scroll-container") as HTMLElement;
        if (editorScrollContainer) {
          editorScrollContainer.style.backgroundColor = "white";
        }

        // Enter fullscreen
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          // Safari
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          // Firefox
          await (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          // IE/Edge
          await (container as any).msRequestFullscreen();
        } else {
          console.warn("FullscreenPlugin: Fullscreen API not supported in this browser");
          // Restore styles if fullscreen failed
          if (container.dataset.originalStyles) {
            const styles = JSON.parse(container.dataset.originalStyles);
            Object.assign(container.style, styles);
            delete container.dataset.originalStyles;
          }
          return;
        }
        // State will be updated by fullscreenchange event listener
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }

        // Restore original styles after exiting fullscreen
        if (container.dataset.originalStyles) {
          const styles = JSON.parse(container.dataset.originalStyles);
          Object.assign(container.style, styles);
          delete container.dataset.originalStyles;
        }
        // State will be updated by fullscreenchange event listener
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
      // Show user-friendly error message
      if (error instanceof Error) {
        console.error("Fullscreen error details:", error.message);
      }
    }
  }, [editor, containerRef]);

  // Keyboard shortcut
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (payload) => {
          const event = payload as KeyboardEvent;
          if (
            (event.metaKey || event.ctrlKey) &&
            event.shiftKey &&
            event.key === "f"
          ) {
            event.preventDefault();
            void toggleFullscreen();
            return true;
          }
          if (event.key === "F11") {
            event.preventDefault();
            void toggleFullscreen();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, toggleFullscreen]);

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <Button
          variant="text"
          onClick={toggleFullscreen}
          title="Fullscreen"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          size="small"
          className="p-2"
        >
          {isFullscreen ? (
            <MinimizeIcon className="size-4" />
          ) : (
            <MaximizeIcon className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
      </TooltipContent>
    </TooltipRoot>
  );
}


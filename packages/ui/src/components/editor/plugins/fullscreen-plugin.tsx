/**
 * Fullscreen Plugin
 *
 * Plugin để toggle fullscreen mode cho editor
 * - Toggle fullscreen on/off
 * - Keyboard shortcut: F11 hoặc Cmd/Ctrl+Shift+F
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { COMMAND_PRIORITY_LOW, KEY_MODIFIER_COMMAND } from "lexical";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";

import { Button } from "@acme/ui/components/button";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@acme/ui/components/tooltip";

interface DocumentWithFullscreen extends Omit<Document, "exitFullscreen"> {
  exitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitFullscreenElement?: Element;
}

interface HTMLElementWithFullscreen extends Omit<
  HTMLElement,
  "requestFullscreen"
> {
  requestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
}

/**
 * Fullscreen Plugin Component
 */
export function FullscreenPlugin({
  containerRef,
}: {
  containerRef?: React.RefObject<HTMLDivElement | null>;
} = {}) {
  const [editor] = useLexicalComposerContext();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const originalStylesRef = useRef<Record<string, string> | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as DocumentWithFullscreen;
      const isNowFullscreen = !!(
        doc.fullscreenElement ??
        doc.webkitFullscreenElement ??
        doc.mozFullScreenElement ??
        doc.msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);

      // If exiting fullscreen, restore styles
      if (!isNowFullscreen) {
        const rootElement = editor.getRootElement();
        if (rootElement) {
          const container =
            containerRef?.current ??
            rootElement.closest<HTMLElement>(".group.rounded-xl.bg-white") ??
            rootElement.closest<HTMLElement>(".rounded-xl.bg-white") ??
            rootElement.closest<HTMLElement>(".editor-scroll-container")
              ?.parentElement ??
            rootElement.closest<HTMLElement>(".relative") ??
            rootElement.parentElement;

          if (container && originalStylesRef.current) {
            Object.assign(container.style, originalStylesRef.current);
            originalStylesRef.current = null;

            // Restore editor scroll container background
            const editorScrollContainer = container.querySelector(
              ".editor-scroll-container",
            ) as unknown as HTMLElement | null;
            if (editorScrollContainer) {
              Object.assign(editorScrollContainer.style, {
                backgroundColor: "",
              });
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
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
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
        // If not found, try to find the outer editor wrapper (the one with bg-white, rounded-xl)
        // If not found, try to find the editor-scroll-container parent
        // If still not found, try to find parent with relative class
        // Last resort: use parent element
        container =
          rootElement.closest<HTMLElement>(".group.rounded-xl.bg-white") ??
          rootElement.closest<HTMLElement>(".rounded-xl.bg-white") ??
          rootElement.closest<HTMLElement>(".editor-scroll-container")
            ?.parentElement ??
          rootElement.closest<HTMLElement>(".relative") ??
          rootElement.parentElement;
      }
    }

    if (!container) {
      console.warn("FullscreenPlugin: Could not find container element");
      return;
    }

    const doc = document as DocumentWithFullscreen;
    const fullscreenEl =
      doc.fullscreenElement ??
      doc.webkitFullscreenElement ??
      doc.mozFullScreenElement ??
      doc.msFullscreenElement;

    try {
      if (fullscreenEl) {
        // Exit fullscreen
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }

        // Restore original styles after exiting fullscreen
        if (originalStylesRef.current) {
          Object.assign(container.style, originalStylesRef.current);
          originalStylesRef.current = null;
        }
        // State will be updated by fullscreenchange event listener
      } else {
        // Store original styles to restore later
        const originalStyles = {
          backgroundColor: container.style.backgroundColor,
          width: container.style.width,
          height: container.style.height,
          margin: container.style.margin,
          borderRadius: container.style.borderRadius,
        };
        originalStylesRef.current = originalStyles;

        // Add fullscreen styling before entering fullscreen
        Object.assign(container.style, {
          backgroundColor: "white",
          width: "100vw",
          height: "100vh",
          margin: "0",
          borderRadius: "0",
          padding: "1rem",
          overflow: "auto",
        });

        // Also ensure editor content has white background
        const editorScrollContainer = container.querySelector(
          ".editor-scroll-container",
        ) as unknown as HTMLElement | null;
        if (editorScrollContainer) {
          Object.assign(editorScrollContainer.style, {
            backgroundColor: "white",
          });
        }

        // Enter fullscreen
        const el = container as HTMLElementWithFullscreen;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          // Safari
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          // Firefox
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          // IE/Edge
          await el.msRequestFullscreen();
        } else {
          console.warn(
            "FullscreenPlugin: Fullscreen API not supported in this browser",
          );
          // Restore styles if fullscreen failed
          Object.assign(container.style, originalStylesRef.current);
          originalStylesRef.current = null;
          return;
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
          const event = payload;
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

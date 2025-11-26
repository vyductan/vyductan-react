/**
 * Export Plugin
 * 
 * Plugin để export editor content ra PDF và Word
 * Hỗ trợ:
 * - Export to PDF
 * - Export to Word (DOCX)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";
import { $getRoot } from "lexical";
import { $convertToMarkdownString } from "@lexical/markdown";
import { DownloadIcon, FileTextIcon, FileIcon } from "lucide-react";
import { MARKDOWN_TRANSFORMERS } from "../transformers/markdown-transformers";

/**
 * Export to PDF using browser print functionality
 */
async function exportToPDF(editor: LexicalEditor, fileName: string) {
  const editorState = editor.getEditorState();
  let htmlContent = "";

  editorState.read(() => {
    const root = $getRoot();
    const markdown = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
    
    // Convert markdown to HTML for better PDF rendering
    // Simple markdown to HTML conversion
    htmlContent = markdown
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^\* (.*$)/gim, "<li>$1</li>")
      .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/`(.*?)`/gim, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n/gim, "<br>");
  });

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export PDF");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${fileName}</title>
        <style>
          @media print {
            @page {
              margin: 1in;
            }
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            h1 { font-size: 24px; margin-top: 20px; margin-bottom: 10px; }
            h2 { font-size: 20px; margin-top: 18px; margin-bottom: 8px; }
            h3 { font-size: 18px; margin-top: 16px; margin-bottom: 6px; }
            p { margin: 10px 0; }
            ul, ol { margin: 10px 0; padding-left: 30px; }
            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
            a { color: #0066cc; text-decoration: none; }
          }
        </style>
      </head>
      <body>
        <div>${htmlContent}</div>
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
    // Close window after print dialog
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  }, 250);
}

/**
 * Export to Word (DOCX) by creating HTML file with proper MIME type
 */
async function exportToWord(editor: LexicalEditor, fileName: string) {
  const editorState = editor.getEditorState();
  let htmlContent = "";

  editorState.read(() => {
    const root = $getRoot();
    const markdown = $convertToMarkdownString(MARKDOWN_TRANSFORMERS);
    
    // Convert markdown to HTML
    htmlContent = markdown
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^\* (.*$)/gim, "<li>$1</li>")
      .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/`(.*?)`/gim, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      .replace(/\n/gim, "<br>");
  });

  // Create Word document HTML
  const wordContent = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${fileName}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
          }
          h1 { font-size: 24px; margin-top: 20px; margin-bottom: 10px; }
          h2 { font-size: 20px; margin-top: 18px; margin-bottom: 8px; }
          h3 { font-size: 18px; margin-top: 16px; margin-bottom: 6px; }
          p { margin: 10px 0; }
          ul, ol { margin: 10px 0; padding-left: 30px; }
          code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
          a { color: #0066cc; text-decoration: none; }
        </style>
      </head>
      <body>
        <div>${htmlContent}</div>
      </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob(
    [
      "\ufeff", // BOM for UTF-8
      wordContent,
    ],
    { type: "application/msword" },
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const fileName = `Document ${new Date().toISOString().split("T")[0]}`;
      await exportToPDF(editor, fileName);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      const fileName = `Document ${new Date().toISOString().split("T")[0]}`;
      await exportToWord(editor, fileName);
    } catch (error) {
      console.error("Error exporting Word:", error);
      alert("Failed to export Word document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TooltipRoot>
      <TooltipTrigger asChild>
        <Dropdown
          menu={{
            items: [
              {
                key: "pdf",
                label: "Export as PDF",
                icon: <FileTextIcon className="size-4" />,
                onClick: handleExportPDF,
                disabled: isExporting,
              },
              {
                key: "word",
                label: "Export as Word",
                icon: <FileIcon className="size-4" />,
                onClick: handleExportWord,
                disabled: isExporting,
              },
            ],
          }}
          placement="bottomRight"
        >
          <Button
            variant="text"
            disabled={isExporting}
            title="Export"
            aria-label="Export document"
            size="small"
            className="p-2"
          >
            <DownloadIcon className="size-4" />
          </Button>
        </Dropdown>
      </TooltipTrigger>
      <TooltipContent>Export Document</TooltipContent>
    </TooltipRoot>
  );
}


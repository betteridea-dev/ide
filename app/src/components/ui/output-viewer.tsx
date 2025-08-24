import React from "react";
import { JsonViewer } from "./json-viewer";
import { SyntaxHighlightedText } from "./syntax-highlighted-text";
import { isValidJSON, detectValueType, isErrorText } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OutputViewerProps {
    output: string;
    className?: string;
    isError?: boolean;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({ output, className, isError }) => {
    // Auto-detect error if not explicitly specified
    const isErrorOutput = isError || isErrorText(output);

    // Base classes with error styling
    const baseClasses = isErrorOutput
        ? "!text-destructive"
        : "text-foreground/90";
    // Check if the output is valid JSON and is a complex object/array (not just a simple string/number)
    if (output && isValidJSON(output)) {
        try {
            const parsedData = JSON.parse(output);
            // Only use JsonViewer for objects and arrays, not for simple values
            if (typeof parsedData === 'object' && parsedData !== null) {
                return (
                    <div className={cn("w-full overflow-auto font-btr-code", baseClasses, className)}>
                        <JsonViewer data={parsedData} isError={isErrorOutput} />
                    </div>
                );
            }
        } catch {
            // Fallback to plain text if parsing fails
        }
    }

    // Check if it's a simple value that should be syntax highlighted
    if (output) {
        const { type } = detectValueType(output);
        if (type !== 'unknown' && output.trim().split('\n').length === 1) {
            // Single line simple value - use syntax highlighting
            return (
                <div className={cn("w-full text-sm max-h-[250px] min-h-[40px] overflow-auto p-3", baseClasses, className)}>
                    <SyntaxHighlightedText text={output} isError={isErrorOutput} />
                </div>
            );
        }
    }

    // Fallback to plain text display for complex text and multi-line content
    return (
        <pre className={cn("w-full text-sm font-btr-code max-h-[250px] min-h-[40px] overflow-auto whitespace-pre-wrap break-all", baseClasses, className)}>
            {output || ""}
        </pre>
    );
};

export default OutputViewer;

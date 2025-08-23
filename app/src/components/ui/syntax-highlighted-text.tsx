import React from "react";
import { detectValueType } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SyntaxHighlightedTextProps {
    text: string;
    className?: string;
}

export const SyntaxHighlightedText: React.FC<SyntaxHighlightedTextProps> = ({ text, className }) => {
    const { type, value } = detectValueType(text);

    const getColorClass = (valueType: string) => {
        switch (valueType) {
            case 'number':
                return 'text-blue-600 dark:text-blue-400';
            case 'boolean':
                return 'text-purple-600 dark:text-purple-400';
            case 'string':
                return 'text-green-600 dark:text-green-400';
            default:
                return 'text-foreground';
        }
    };

    return (
        <span className={cn("font-btr-code", getColorClass(type), className)}>
            {value}
        </span>
    );
};

export default SyntaxHighlightedText;

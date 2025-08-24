import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
    data: any;
    className?: string;
    isError?: boolean;
}

interface JsonNodeProps {
    data: any;
    keyName?: string;
    level?: number;
    isLast?: boolean;
    isError?: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = ({ data, keyName, level = 0, isLast = true, isError = false }) => {
    // Collapse nested items by default (level > 0), keep root level expanded
    const [isCollapsed, setIsCollapsed] = useState(level > 0);

    const indent = level * 20;
    const isObject = typeof data === 'object' && data !== null && !Array.isArray(data);
    const isArray = Array.isArray(data);
    const isCollapsible = isObject || isArray;
    const isEmpty = isCollapsible && Object.keys(data).length === 0;

    const renderValue = (value: any) => {
        const baseClasses = isError ? "text-destructive" : "";

        if (value === null) return <span className={cn("text-gray-500 font-btr-code", baseClasses)}>null</span>;
        if (typeof value === 'string') return <span className={cn("text-green-600 font-btr-code", baseClasses)}>"{value}"</span>;
        if (typeof value === 'number') return <span className={cn("text-blue-600 font-btr-code", baseClasses)}>{value}</span>;
        if (typeof value === 'boolean') return <span className={cn("text-purple-600 font-btr-code", baseClasses)}>{String(value)}</span>;
        return <span className={cn("font-btr-code", baseClasses)}>{String(value)}</span>;
    };

    const toggleCollapse = () => {
        if (isCollapsible && !isEmpty) {
            setIsCollapsed(!isCollapsed);
        }
    };

    if (!isCollapsible) {
        const keyClasses = isError ? "text-destructive" : "text-blue-800 dark:text-blue-300";
        const punctuationClasses = isError ? "text-destructive" : "text-gray-600";

        return (
            <div style={{ marginLeft: indent }} className="font-btr-code text-sm break-all">
                {keyName && (
                    <>
                        <span className={cn(keyClasses, "font-btr-code")}>"{keyName}"</span>
                        <span className={cn(punctuationClasses, "font-btr-code")}>: </span>
                    </>
                )}
                <span className="font-btr-code">{renderValue(data)}</span>
                {!isLast && <span className={cn(punctuationClasses, "font-btr-code")}>,</span>}
            </div>
        );
    }

    const entries = isArray ? data.map((item, index) => [index, item]) : Object.entries(data);

    const keyClasses = isError ? "text-destructive" : "text-blue-800 dark:text-blue-300";
    const punctuationClasses = isError ? "text-destructive" : "text-gray-600";
    const chevronClasses = isError ? "text-destructive" : "text-gray-500";
    const summaryClasses = isError ? "text-destructive" : "text-gray-400";

    return (
        <div className="font-btr-code text-sm">
            <div
                style={{ marginLeft: indent }}
                className={cn(
                    "flex items-start break-all font-btr-code",
                    isCollapsible && !isEmpty && "cursor-pointer hover:bg-muted/30 rounded px-1"
                )}
                onClick={toggleCollapse}
            >
                {isCollapsible && !isEmpty && (
                    <span className={cn("mr-0 p-0 flex items-center justify-center w-5 h-5", chevronClasses)}>
                        {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    </span>
                )}
                {keyName && (
                    <>
                        <span className={cn(keyClasses, "font-btr-code")}>"{keyName}"</span>
                        <span className={cn(punctuationClasses, "font-btr-code")}>: </span>
                    </>
                )}
                <span className={cn(punctuationClasses, "font-btr-code")}>
                    {isArray ? '[' : '{'}
                    {isEmpty && (isArray ? ']' : '}')}
                    {!isEmpty && isCollapsed && (
                        <span className={cn(summaryClasses, "ml-1 font-btr-code")}>
                            ...{entries.length} item{entries.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </span>
                {!isEmpty && isCollapsed && (
                    <span className={cn(punctuationClasses, "ml-1 font-btr-code")}>{isArray ? ']' : '}'}</span>
                )}
                {!isLast && isCollapsed && <span className={cn(punctuationClasses, "font-btr-code")}>,</span>}
            </div>

            {!isCollapsed && !isEmpty && (
                <>
                    {entries.map(([key, value], index) => (
                        <JsonNode
                            key={key}
                            data={value}
                            keyName={isArray ? undefined : String(key)}
                            level={level + 1}
                            isLast={index === entries.length - 1}
                            isError={isError}
                        />
                    ))}
                    <div style={{ marginLeft: indent }} className={cn(punctuationClasses, "font-btr-code")}>
                        {isArray ? ']' : '}'}
                        {!isLast && <span className="font-btr-code">,</span>}
                    </div>
                </>
            )}
        </div>
    );
};

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, className, isError = false }) => {
    return (
        <div className={cn("font-btr-code text-sm overflow-auto", className)}>
            <JsonNode data={data} isError={isError} />
        </div>
    );
};

export default JsonViewer;

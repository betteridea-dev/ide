import React, { useState } from "react";
import { useGlobalState } from "@/hooks/use-global-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OutputViewer } from "@/components/ui/output-viewer";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, Play, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryEntry {
    id: string;
    timestamp: Date;
    fileName: string;
    code: string;
    output: string;
    projectId: string;
    isMainnet: boolean;
    isError: boolean;
}

export default function History() {
    const { history } = useGlobalState();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                <Clock size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-btr-code">No execution history yet</p>
                <p className="text-xs mt-2 text-center">
                    Run some code to see execution history here
                </p>
            </div>
        );
    }

    const formatTimestamp = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(date);
    };

    const toggleExpanded = (entryId: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(entryId)) {
                newSet.delete(entryId);
            } else {
                newSet.add(entryId);
            }
            return newSet;
        });
    };

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                {history.map((entry, index) => {
                    // Most recent item (index 0) is expanded by default
                    const isExpanded = index === 0 ? !expandedItems.has(entry.id) : expandedItems.has(entry.id);

                    return (
                        <div key={entry.id} className={`border rounded-lg bg-card/50 ${entry.isError ? 'border-destructive/30' : ''}`}>
                            {/* Header - Always visible */}
                            <div className="p-4 pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-accent/80"
                                            onClick={() => toggleExpanded(entry.id)}
                                        >
                                            {isExpanded ? (
                                                <ChevronDown size={14} className="text-muted-foreground" />
                                            ) : (
                                                <ChevronRight size={14} className="text-muted-foreground" />
                                            )}
                                        </Button>
                                        {entry.isError ? (
                                            <AlertCircle size={14} className="text-destructive" />
                                        ) : (
                                            <Play size={14} className="text-primary" />
                                        )}
                                        <span className="font-btr-code text-sm font-medium">
                                            {entry.fileName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock size={12} />
                                        <span className="font-btr-code">
                                            {formatTimestamp(entry.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Expandable Content */}
                            {isExpanded && (
                                <div className="px-4 pb-4">
                                    {/* Code Section */}
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Code size={14} className="text-muted-foreground" />
                                            <span className="text-xs font-medium text-muted-foreground">Code</span>
                                        </div>
                                        <div className="bg-muted/30 rounded-md p-3 border">
                                            <pre className="text-xs font-btr-code overflow-x-auto whitespace-pre-wrap">
                                                {entry.code}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Output Section */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`w-3 h-3 rounded-full ${entry.isError
                                                ? 'bg-destructive/20 border border-destructive/40'
                                                : 'bg-green-500/20 border border-green-500/40'
                                                }`} />
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {entry.isError ? 'Error' : 'Output'}
                                            </span>
                                        </div>
                                        <div className="bg-muted/30 rounded-md border">
                                            <OutputViewer
                                                output={entry.output}
                                                className="max-h-48 text-xs"
                                                isError={entry.isError}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Separator for all but last item */}
                            {index < history.length - 1 && (
                                <Separator className="mt-2" />
                            )}
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}

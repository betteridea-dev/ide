import { useEffect, useState } from "react";
import { useGlobalState } from "@/hooks/use-global-state";
import { useProjects } from "@/hooks/use-projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Mail, AlertCircle, Clock, User, ChevronRight, MessageSquare, Shield, ShieldCheck, Send, Server, Inbox as InboxIcon, FileText, Hash, Calendar, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { MainnetAO, type Tag } from "@/lib/ao";
import { useSettings } from "@/hooks/use-settings";
import React from "react";
import JsonViewer from "./ui/json-viewer";

interface Commitment {
    bundle: string;
    "commitment-device": string;
    commited: string[];
    commiter: string;
    keyid: string;
    "original-tags": Tag[];
    signature: string;
    type: string;
    [key: string]: any;
}

interface InboxItem {
    from?: string;
    authority?: string;
    data?: string | object;
    action?: string;
    target?: string;
    trusted?: boolean;
    type?: "Process" | "Message";
    name?: string;
    module?: string;
    commitments?: Record<string, Commitment>;
    [key: string]: any;
}

type Inbox = Record<string, InboxItem>;

export default function Inbox() {
    const { HB_URL, GATEWAY_URL } = useSettings();
    const { activeProject: activeProjectId } = useGlobalState();
    const activeProject = useProjects(p => p.projects[activeProjectId]);
    const processId = activeProject?.process;

    const [inbox, setInbox] = useState<Inbox | null>({});
    const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const ao = new MainnetAO({
        HB_URL,
        GATEWAY_URL
    });

    const loadInbox = async () => {
        if (!processId) return;

        setIsLoading(true);
        try {
            const hashpath = `/${processId}/now/Inbox`;
            const res = await ao.read<Inbox>({ path: hashpath }).then(ao.sanitizeResponse);
            setInbox(res);

            // Auto-select first message if none selected
            if (!selectedMessage && res && Object.keys(res).length > 0) {
                setSelectedMessage(Object.keys(res)[0]);
            }
        } catch (error) {
            console.error("Failed to load inbox:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshInbox = async () => {
        setIsRefreshing(true);
        await loadInbox();
        setIsRefreshing(false);
    };

    useEffect(() => {
        loadInbox();
    }, [processId]);

    const formatTimestamp = (timestamp: string | number) => {
        try {
            const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) : timestamp);
            return date.toLocaleString();
        } catch {
            return "Unknown time";
        }
    };

    const truncateAddress = (address: string, length = 8) => {
        if (!address) return "Unknown";
        return address.length > length * 2
            ? `${address.slice(0, length)}...${address.slice(-length)}`
            : address;
    };

    const getMessageTypeIcon = (type: string) => {
        if (!type) return Mail;

        switch (type) {
            case "Process":
                return Server;
            case "Message":
                return MessageSquare;
            default:
                return Mail;
        }
    };

    const getActionIcon = (action: string) => {
        if (!action) return FileText;

        switch (action.toLowerCase()) {
            case "send":
                return Send;
            case "receive":
                return Mail;
            default:
                return FileText;
        }
    };

    const renderMessageData = (data: string | object | undefined, truncate = false): string => {
        if (!data) return "";

        let content: string;
        if (typeof data === 'string') {
            content = data;
        } else {
            try {
                content = JSON.stringify(data, null, 2);
            } catch (error) {
                content = "[Invalid JSON data]";
            }
        }

        if (truncate && content.length > 100) {
            return `${content.substring(0, 100)}...`;
        }

        return content;
    };

    const MessagePreview = ({ messageId, message, isSelected, onClick }: {
        messageId: string;
        message: InboxItem;
        isSelected: boolean;
        onClick: () => void;
    }) => {
        const TypeIcon = getMessageTypeIcon(message.type);
        const ActionIcon = getActionIcon(message.action);

        return (
            <div
                className={cn(
                    "flex flex-col p-4 border-b border-border cursor-pointer transition-all duration-200 hover:bg-muted/30",
                    isSelected && "bg-muted/50 border-l-4 border-l-primary"
                )}
                onClick={onClick}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">
                                    {message.type || "Unknown Type"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span className="truncate">
                                    {truncateAddress(message.from)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1">
                            {message.action && <Badge variant="secondary" className="text-xs">
                                {message.action}
                            </Badge>}
                        </div>
                    </div>
                </div>

                {message.data && (
                    <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {renderMessageData(message.data, true)}
                    </div>
                )}
            </div>
        );
    };

    const MessageDetail = ({ message }: { message: InboxItem }) => {
        const [showRawData, setShowRawData] = useState(false);

        return (
            <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                    {React.createElement(getMessageTypeIcon(message.type), {
                                        className: "h-5 w-5 text-foreground"
                                    })}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {message.type || "Unknown Type"}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={message.action ? "default" : "secondary"}>
                                            {message.action || "no action"}
                                        </Badge>
                                        {message.trusted === true && (
                                            <Badge variant="secondary" className="text-green-700 dark:text-green-400">
                                                <ShieldCheck className="h-3 w-3 mr-1" />
                                                Trusted
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* toggle to show raw message json instead of the UI */}
                            <Button variant="outline" size="sm" onClick={() => setShowRawData(!showRawData)}>
                                {showRawData ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} Raw
                            </Button>
                        </div>

                        <Separator />
                    </div>

                    {/* Message Details */}
                    {showRawData ? <>
                        <JsonViewer data={message} />
                    </> : <div className="grid gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Sender Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">From:</span>
                                        <span className="font-btr-code text-xs">{message.from || "Unknown"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Target:</span>
                                        <span className="font-btr-code text-xs">{message.target || "Unknown"}</span>
                                    </div>
                                    {message.module && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Module:</span>
                                            <span className="font-btr-code text-xs">{message.module}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Message Content */}
                        {message.data && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Message Data
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn(
                                        "p-3 bg-muted/30 border rounded-md text-sm font-btr-code whitespace-pre-wrap break-words",
                                        showRawData ? "max-h-none" : "max-h-48 overflow-hidden"
                                    )}>
                                        {renderMessageData(message.data)}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Commitments */}
                        {message.commitments && Object.keys(message.commitments).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Hash className="h-4 w-4" />
                                        Commitments ({Object.keys(message.commitments).length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(message.commitments).map(([key, commitment]) => (
                                            <div key={key} className="p-3 flex justify-between bg-muted/20 border rounded-md">
                                                <div className="text-xs text-muted-foreground">
                                                    {key}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {commitment.type}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>}
                </div>
            </ScrollArea>
        );
    };

    const inboxEntries = inbox ? Object.entries(inbox) : [];
    const selectedMessageData = selectedMessage && inbox ? inbox[selectedMessage] : null;

    if (!processId) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                    <InboxIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="space-y-1">
                        <h3 className="font-medium">No Process Selected</h3>
                        <p className="text-sm text-muted-foreground">
                            Select a project with an active process to view its inbox
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-background">
            {/* Message List */}
            <div className="w-1/3 border-r border-border flex flex-col">
                {/* Header */}
                <div className="p-2 px-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <InboxIcon className="h-5 w-5" />
                            <h1 className="font-semibold">Inbox</h1>
                            <Badge variant="secondary" className="text-xs">
                                {inboxEntries.length}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={refreshInbox}
                            disabled={isRefreshing}
                            className="h-8 w-8 p-0"
                        >
                            <RefreshCw className={cn(
                                "h-4 w-4",
                                isRefreshing && "animate-spin"
                            )} />
                        </Button>
                    </div>
                </div>

                {/* Message List */}
                <ScrollArea className="flex-1 h-0 overflow-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-3">
                                <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto" />
                                <p className="text-sm text-muted-foreground">Loading messages...</p>
                            </div>
                        </div>
                    ) : inboxEntries.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-3">
                                <Mail className="h-8 w-8 text-muted-foreground mx-auto" />
                                <div className="space-y-1">
                                    <h3 className="font-medium">No Messages</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Your inbox is empty
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {inboxEntries.reverse().map(([messageId, message]) => (
                                <MessagePreview
                                    key={messageId}
                                    messageId={messageId}
                                    message={message}
                                    isSelected={selectedMessage === messageId}
                                    onClick={() => setSelectedMessage(messageId)}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Message Detail */}
            <div className="flex-1 flex flex-col">
                {selectedMessageData ? (
                    <MessageDetail message={selectedMessageData} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                            <div className="space-y-1">
                                <h3 className="font-medium">Select a Message</h3>
                                <p className="text-sm text-muted-foreground">
                                    Choose a message from the list to view its details
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

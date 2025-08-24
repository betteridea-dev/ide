import React, { useState, useEffect } from "react";
import Terminal from "./terminal";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { useGlobalState } from "@/hooks/use-global-state";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "./ui/button";
import { X, LoaderIcon, Play } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import SingleFileEditor from "./editor/single-file-editor";
import NotebookEditor from "./editor/notebook-editor";
import { useTheme } from "@/components/theme-provider";
import { getFileIconElement, createAOSigner, parseOutput, stripAnsiCodes, isExecutionError, isErrorText } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { MainnetAO, TestnetAO } from "@/lib/ao";
import { useActiveAddress } from "@arweave-wallet-kit/react";
import { toast } from "sonner";
import { OutputViewer } from "@/components/ui/output-viewer";
import Inbox from "./inbox";
import History from "./editor/history";

function FileTabItem({ filename }: { filename: string }) {
    const { activeFile, actions } = useGlobalState();
    const [hovered, setHovered] = useState(false);
    const active = activeFile === filename;

    const handleCloseFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        actions.closeOpenedFile(filename);
    };

    return (
        <div
            className={`
                relative flex items-center gap-2 px-3 py-2 h-[35px] min-w-0 max-w-[200px]
                border-r border-border/30 cursor-pointer select-none
                transition-all duration-200 ease-in-out
                ${active
                    ? 'bg-background text-foreground shadow-sm border-b-2 border-b-primary/80'
                    : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground/90 hover:shadow-sm'
                }
                ${hovered ? 'pr-8' : ''}
            `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => actions.setActiveFile(filename)}
        >
            {/* File Icon */}
            <div className="flex-shrink-0">
                {getFileIconElement(filename, 16)}
            </div>

            {/* File Name */}
            <span className="truncate text-sm font-medium">
                {filename}
            </span>

            {/* Close Button */}
            {hovered && (
                <button
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-sm hover:bg-muted/60 dark:hover:bg-muted/40 transition-all duration-150"
                    onClick={handleCloseFile}
                    aria-label={`Close ${filename}`}
                >
                    <X size={14} className="text-muted-foreground/70 hover:text-foreground/90" />
                </button>
            )}

            {/* Active indicator dot (optional) */}
            {/* {active && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
            )} */}
        </div>
    );
}

function switchFileType(activeFile: string): React.JSX.Element {
    if (!activeFile) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No file selected
            </div>
        );
    }

    // Check file extension for different editor types
    switch (activeFile.split(".").pop()) {
        case "luanb":
            return <NotebookEditor />;
        default:
            const type = activeFile.split(":")[0];
            switch (type) {
                case "PKG":
                    // TODO: Add package view when needed
                    return <SingleFileEditor />;
                case "TBL":
                    // TODO: Add table view when needed
                    return <SingleFileEditor />;
                default:
                    return <SingleFileEditor />;
            }
    }
}

export default function Editor() {
    const { activeProject, activeFile, openedFiles, output, actions } = useGlobalState();
    const { projects } = useProjects();
    const { theme } = useTheme();
    const settings = useSettings();
    const activeAddress = useActiveAddress();
    const [running, setRunning] = useState(false);

    const project = projects[activeProject];
    const file = project?.files[activeFile];

    const isLuaFile = activeFile?.endsWith(".lua");
    const isCodeFile = activeFile && (
        activeFile.endsWith(".lua") ||
        activeFile.endsWith(".js") ||
        activeFile.endsWith(".ts") ||
        activeFile.endsWith(".tsx") ||
        activeFile.endsWith(".jsx")
    );

    // Auto-save functionality
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Force save all open files before page unload
            openedFiles.forEach(fileName => {
                const fileToSave = project?.files[fileName];
                if (fileToSave) {
                    // console.log("Auto-saving file before unload:", fileName);
                }
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [openedFiles, project]);

    async function runLuaFile() {
        if (!activeFile || !project || !file) return;

        setRunning(true);
        actions.setOutput(""); // Clear previous output

        try {
            // Get the current file content
            const firstCellId = file.cellOrder[0];
            const code = firstCellId && file.cells?.[firstCellId] ? file.cells[firstCellId].content : "";

            if (!code.trim()) {
                actions.setOutput("No code to execute");
                return;
            }

            // Check if project has a process ID
            if (!project.process) {
                actions.setOutput("Error: No process ID found for this project. Please set a process ID in project settings.");
                toast.error("No process ID configured for this project");
                return;
            }

            actions.setOutput("");

            // Determine if this is a mainnet or testnet project
            if (project.isMainnet) {
                // Mainnet execution
                if (!activeAddress) {
                    actions.setOutput("Error: Wallet connection required for mainnet execution");
                    toast.error("Please connect your wallet to run code on mainnet");
                    return;
                }

                const signer = createAOSigner();
                const ao = new MainnetAO({
                    GATEWAY_URL: settings.actions.getGatewayUrl(),
                    HB_URL: settings.actions.getHbUrl(),
                    signer
                });

                // Remove the "Running on mainnet..." message

                // Execute the Lua code
                const result = await ao.runLua({
                    processId: project.process,
                    code: code
                });
                console.log("result", result)

                const parsedOutput = parseOutput(result);
                const hasError = isExecutionError(result);
                actions.setOutput(parsedOutput);

                // Add to history
                actions.addHistoryEntry({
                    fileName: activeFile,
                    code: code,
                    output: parsedOutput,
                    projectId: activeProject,
                    isMainnet: true,
                    isError: hasError
                });

                // Show toast if execution failed
                if (hasError) {
                    toast.error("Code execution failed");
                }

            } else {
                actions.setOutput("Testnet execution is currently disabled. Please use a mainnet project.");
                toast.error("Testnet execution is not available");
            }

        } catch (error) {
            const errorMessage = `Error running Lua code: ${error instanceof Error ? error.message : String(error)}`;
            console.error(errorMessage);
            actions.setOutput(`Error: ${errorMessage}`);
            toast.error("Failed to execute code");
        } finally {
            setRunning(false);
        }
    }

    return (
        <ResizablePanelGroup direction="vertical">
            <ResizablePanel collapsible defaultSize={50} minSize={10}>
                {/* FILE BAR */}
                <div className="h-[36px] flex overflow-x-auto border-b bg-card/30 backdrop-blur-sm relative scrollbar-hide">
                    <div className="flex h-full">
                        {openedFiles.map((file) => (
                            <FileTabItem key={file} filename={file} />
                        ))}
                    </div>
                    {activeFile && isCodeFile && (
                        <div className="absolute right-0 top-0 h-[35px] border-l border-border/30 bg-card/80 backdrop-blur-sm flex items-center justify-center">
                            <Button
                                variant="ghost"
                                id="run-code-btn"
                                className="h-[35px] w-[35px] p-0 rounded-none hover:bg-primary/15 dark:hover:bg-primary/10 transition-all duration-150"
                                onClick={runLuaFile}
                                disabled={running}
                                title={`Run ${activeFile} (Shift+Enter)`}
                            >
                                {running ? (
                                    <LoaderIcon size={20} className="animate-spin text-primary" />
                                ) : (
                                    <Play size={20} className="text-primary fill-primary" />
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* FILE CONTENTS */}
                <div className="h-[calc(100%-35px)] overflow-hidden">
                    {switchFileType(activeFile)}
                </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={20} minSize={5} collapsible className="relative">
                {/* BOTTOM PANEL WITH TABS */}
                <div className="h-full">
                    <Tabs className="h-full relative gap-0" defaultValue="terminal">
                        <TabsList className="h-[29px] border-b rounded-none w-full justify-start overflow-clip bg-transparent p-0">
                            <TabsTrigger value="terminal" className="rounded-none data-[state=active]:!bg-primary data-[state=active]:!text-white">
                                Terminal
                            </TabsTrigger>
                            <TabsTrigger value="inbox" className="rounded-none data-[state=active]:!bg-primary data-[state=active]:!text-white">
                                Inbox
                            </TabsTrigger>
                            <TabsTrigger value="output" className="rounded-none data-[state=active]:!bg-primary data-[state=active]:!text-white">
                                Output
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-none data-[state=active]:!bg-primary data-[state=active]:!text-white">
                                History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="terminal" className="h-[calc(100%-30px)] overflow-hidden m-0 p-0">
                            <Terminal />
                        </TabsContent>

                        <TabsContent value="inbox" className="h-[calc(100%-30px)] overflow-scroll m-0 p-0">
                            <Inbox />
                        </TabsContent>

                        <TabsContent value="output" className="h-[calc(100%-30px)] overflow-hidden m-0 p-2">
                            {output ? (
                                <OutputViewer
                                    output={output}
                                    className="h-full w-full"
                                    isError={isErrorText(output)}
                                />
                            ) : (
                                <div className="text-sm font-btr-code text-muted-foreground">
                                    Output panel - execution results will appear here
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="h-[calc(100%-30px)] overflow-hidden m-0 p-0">
                            <History />
                        </TabsContent>
                    </Tabs>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
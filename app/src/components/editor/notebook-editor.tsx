import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/use-global-state";
import { useProjects, type File, type Project, type Cell } from "@/hooks/use-projects";
import { DiffEditor, Editor, useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useTheme } from "@/components/theme-provider";
import {
    Check,
    ChevronsDownUpIcon,
    ChevronsUpDown,
    Edit,
    LoaderIcon,
    Play,
    SquareCheckBig,
    Trash2
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import notebookTheme from "@/assets/themes/notebook.json";
import { useSettings } from "@/hooks/use-settings";
import { MainnetAO, TestnetAO } from "@/lib/ao";
import { useActiveAddress } from "@arweave-wallet-kit/react";
import { createAOSigner, parseOutput, isExecutionError, isErrorText } from "@/lib/utils";
import { toast } from "sonner";
import { OutputViewer } from "@/components/ui/output-viewer";

// Use the Cell interface from use-projects.ts
type NotebookCell = Cell & {
    code: string; // Map content to code for compatibility
};

const monacoConfig: editor.IStandaloneEditorConstructionOptions = {
    fontSize: 14,
    inlineSuggest: { enabled: true },
    fontFamily: '"DM Mono", monospace',
    minimap: { enabled: false },
    lineHeight: 20,
    lineNumbersMinChars: 2,
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 10,
    scrollbar: {
        vertical: "hidden",
        horizontal: "hidden",
        alwaysConsumeMouseWheel: false
    },
    renderLineHighlight: "none",
    smoothScrolling: true,
};

const diffMonacoConfig: editor.IDiffEditorConstructionOptions = {
    ...monacoConfig,
    renderSideBySide: false,
};

interface CodeCellProps {
    file: File;
    cellId: string;
    project: Project;
    cell: NotebookCell;
    onUpdateCell: (cellId: string, updates: Partial<NotebookCell>) => void;
    onDeleteCell: (cellId: string) => void;
    onRunCell: (cellId: string, code: string) => Promise<void>;
    registerMonacoInstance: (monaco: typeof import("monaco-editor")) => void;
    unregisterMonacoInstance: (monaco: typeof import("monaco-editor")) => void;
}

const CodeCell: React.FC<CodeCellProps> = ({
    file,
    cellId,
    project,
    cell,
    onUpdateCell,
    onDeleteCell,
    onRunCell,
    registerMonacoInstance,
    unregisterMonacoInstance
}) => {
    const [mouseHovered, setMouseHovered] = useState(false);
    const [running, setRunning] = useState(false);
    const [expand, setExpand] = useState(false);
    const { theme } = useTheme();
    const thisEditor = useRef<editor.IStandaloneCodeEditor>(null);

    // Refs to store Monaco instances for theme updates
    const monacoRef = useRef<typeof import("monaco-editor") | null>(null);
    const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);

    const runCellCode = async () => {
        console.log("running cell code", cellId);
        setRunning(true);
        try {
            await onRunCell(cellId, cell.code);
        } catch (error) {
            console.error("Error running cell:", error);
        } finally {
            setRunning(false);
        }
    };



    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.metaKey && e.key === "Enter") {
                document.getElementById(`accept-changes-btn-${cellId}`)?.click();
            } else if (e.metaKey && e.key === "Backspace") {
                document.getElementById(`reject-changes-btn-${cellId}`)?.click();
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [cellId]);

    const applyTheme = useCallback((monaco: typeof import("monaco-editor")) => {
        const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        if (isDark) {
            monaco.editor.setTheme("notebook");
        } else {
            monaco.editor.setTheme("vs-light");
        }
    }, [theme]);

    // Add theme change listener for dynamic theme switching
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "vite-ui-theme" && monacoRef.current) {
                // Force Monaco to update theme when storage changes
                setTimeout(() => {
                    if (monacoRef.current) {
                        const isDark = e.newValue === "dark" || (e.newValue === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                        if (isDark) {
                            monacoRef.current.editor.setTheme("notebook");
                        } else {
                            monacoRef.current.editor.setTheme("vs-light");
                        }
                    }
                }, 100);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // React to theme context changes
    useEffect(() => {
        if (monacoRef.current) {
            applyTheme(monacoRef.current);
        }
    }, [theme, applyTheme]);

    // Cleanup Monaco instances on unmount
    useEffect(() => {
        return () => {
            if (monacoRef.current) {
                unregisterMonacoInstance(monacoRef.current);
            }
            if (diffEditorRef.current) {
                // DiffEditor uses the same Monaco instance, so no need to unregister twice
            }
        };
    }, [unregisterMonacoInstance]);

    return (
        <div
            className="rounded-lg relative bg-card/50 dark:bg-card/30 flex flex-col border border-border/50 dark:border-border/30 shadow-sm hover:shadow-md transition-all duration-200 hover:border-border/70 dark:hover:border-border/50"
            data-cellid={cellId}
            onMouseEnter={() => setMouseHovered(true)}
            onMouseLeave={() => setMouseHovered(false)}
        >
            {/* Hover buttons */}
            {mouseHovered && (
                <div className="absolute flex justify-center items-center -top-3 right-3 z-10 bg-background/95 dark:bg-background/90 backdrop-blur-sm border border-border/60 rounded-md p-1 shadow-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteCell(cellId)}
                        title="Delete cell"
                    >
                        <Trash2 size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpand(!expand)}
                        className="h-7 w-7 p-0 hover:bg-accent/80"
                        title={expand ? "Collapse cell" : "Expand cell"}
                    >
                        {expand ? <ChevronsDownUpIcon size={14} /> : <ChevronsUpDown size={14} />}
                    </Button>
                </div>
            )}

            <div className="flex h-fit relative justify-start rounded-t-lg border-b border-border/40 min-h-[60px] overflow-clip">
                <Button
                    variant="ghost"
                    className="p-4 h-full rounded-tl-lg rounded-br-none rounded-tr-none rounded-bl-none min-w-[60px] flex items-center justify-center hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors group"
                    onClick={runCellCode}
                    id={`run-cell-${cellId}`}
                    disabled={running}
                    title="Run cell (Shift+Enter)"
                >
                    {running ? (
                        <LoaderIcon size={20} className="animate-spin text-primary" />
                    ) : (
                        <Play
                            size={18}
                            className="text-primary/80 group-hover:text-primary transition-colors"
                            fill="currentColor"
                        />
                    )}
                </Button>

                <div className="w-full h-full text-xs grow relative bg-background/50 dark:bg-background/30">
                    {cell.diffNew ? (
                        <>
                            <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 dark:bg-muted/30 border-b border-border/30">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    id={`reject-changes-btn-${cellId}`}
                                    className="text-xs h-7 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                    onClick={() => {
                                        onUpdateCell(cellId, { diffNew: undefined });
                                    }}
                                >
                                    Reject {/Mac/.test(navigator.userAgent) ? '⌘⌫' : 'Ctrl+⌫'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    id={`accept-changes-btn-${cellId}`}
                                    className="text-xs h-7 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                    onClick={() => {
                                        onUpdateCell(cellId, {
                                            code: cell.diffNew || cell.code,
                                            diffNew: undefined
                                        });
                                    }}
                                >
                                    Accept {/Mac/.test(navigator.userAgent) ? '⌘⏎' : 'Ctrl⏎'}
                                </Button>
                            </div>
                            <DiffEditor
                                data-cellId={cellId}
                                original={cell.code}
                                modified={cell.diffNew}
                                language="lua"
                                options={diffMonacoConfig}
                                height={
                                    2 * (expand ? Math.max(cell.code.split("\n").length * 20, 60) :
                                        (cell.code.split("\n").length > 15 ? 15 * 20 : Math.max((cell.code.split("\n").length) * 20, 60)))
                                }
                                onMount={(editor, monaco) => {
                                    // Store Monaco instances in refs
                                    monacoRef.current = monaco;
                                    diffEditorRef.current = editor;

                                    monaco.editor.defineTheme(
                                        "notebook",
                                        notebookTheme as editor.IStandaloneThemeData
                                    );

                                    // Register with central theme manager
                                    registerMonacoInstance(monaco);
                                    applyTheme(monaco);

                                    editor.getContainerDomNode().addEventListener("keydown", async (e) => {
                                        if (e.metaKey && e.key === "Enter") {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            document.getElementById(`accept-changes-btn-${cellId}`)?.click();
                                        } else if (e.metaKey && e.key === "Backspace") {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            document.getElementById(`reject-changes-btn-${cellId}`)?.click();
                                        }
                                    });
                                }}
                            />
                        </>
                    ) : (
                        <Editor
                            data-cellId={cellId}
                            onMount={(editor, monaco) => {
                                // Store Monaco instances in refs
                                thisEditor.current = editor;
                                monacoRef.current = monaco;

                                monaco.editor.defineTheme(
                                    "notebook",
                                    notebookTheme as editor.IStandaloneThemeData
                                );

                                // Register with central theme manager
                                registerMonacoInstance(monaco);
                                applyTheme(monaco);

                                // Add command only to this particular cell
                                editor.getContainerDomNode().addEventListener("keydown", async (e) => {
                                    if (e.shiftKey && e.key === "Enter" && !e.metaKey) {
                                        e.preventDefault();
                                        const runbtn = document.getElementById(`run-cell-${cellId}`);
                                        runbtn?.click();
                                    }
                                });

                                editor.addAction({
                                    id: "format-code",
                                    label: "Format Code",
                                    contextMenuGroupId: "navigation",
                                    run: async function (editor) {
                                        try {
                                            // Try to format Lua code if available
                                            const input = editor.getValue();
                                            console.log("formatting code");
                                            // For now, just use basic formatting
                                            const formatted = input.split('\n').map(line => line.trim()).join('\n');
                                            editor.setValue(formatted);
                                        } catch (error) {
                                            console.log("Format not available");
                                        }
                                    },
                                });
                            }}
                            onChange={(value) => {
                                onUpdateCell(cellId, { code: value || "" });
                            }}
                            height={
                                expand ? Math.max(cell.code.split("\n").length * 20, 60) :
                                    (cell.code.split("\n").length > 15 ? 15 * 20 : Math.max((cell.code.split("\n").length) * 20, 60))
                            }
                            width="100%"
                            className="min-h-[60px] block py-0 font-btr-code overflow-y-clip"
                            value={cell.code}
                            defaultValue={cell.code}
                            language="lua"
                            options={monacoConfig}
                        />
                    )}
                    <div id={`status-${cellId}`} className="h-fit text-[10px] grow ml-10 z-20 bg-inherit w-fit text-left flex items-start justify-start"></div>
                </div>
            </div>

            {/* Output section */}
            <div className="flex bg-muted/30 dark:bg-muted/20 rounded-b-lg">
                <div className="w-16 text-center flex items-start pt-3 justify-center text-muted-foreground/60 text-[10px] font-btr-code">
                    [{file.cellOrder.indexOf(cellId) + 1}]
                </div>
                <div className="w-full p-3 bg-transparent border-l border-border/30 overflow-hidden">
                    <OutputViewer
                        output={typeof cell.output === "object" ? JSON.stringify(cell.output, null, 2) : (cell.output as string) || ""}
                        className="max-h-[250px] min-h-[40px] w-full"
                        isError={typeof cell.output === "string" && isErrorText(cell.output)}
                    />
                </div>
            </div>
        </div>
    );
};

interface VisualCellProps {
    file: File;
    cellId: string;
    project: Project;
    cell: NotebookCell;
    onUpdateCell: (cellId: string, updates: Partial<NotebookCell>) => void;
    onDeleteCell: (cellId: string) => void;
    registerMonacoInstance: (monaco: typeof import("monaco-editor")) => void;
    unregisterMonacoInstance: (monaco: typeof import("monaco-editor")) => void;
}

const VisualCell: React.FC<VisualCellProps> = ({
    file,
    cellId,
    project,
    cell,
    onUpdateCell,
    onDeleteCell,
    registerMonacoInstance,
    unregisterMonacoInstance
}) => {
    const [mouseHovered, setMouseHovered] = useState(false);
    const [editing, setEditing] = useState(cell.editing || false);
    const [expand, setExpand] = useState(false);
    const { theme } = useTheme();

    // Refs to store Monaco instances for theme updates
    const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

    const applyTheme = useCallback((monaco: typeof import("monaco-editor")) => {
        const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        if (isDark) {
            monaco.editor.setTheme("notebook");
        } else {
            monaco.editor.setTheme("vs-light");
        }
    }, [theme]);

    // Add theme change listener for dynamic theme switching
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "vite-ui-theme" && monacoRef.current) {
                // Force Monaco to update theme when storage changes
                setTimeout(() => {
                    if (monacoRef.current) {
                        const isDark = e.newValue === "dark" || (e.newValue === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                        if (isDark) {
                            monacoRef.current.editor.setTheme("notebook");
                        } else {
                            monacoRef.current.editor.setTheme("vs-light");
                        }
                    }
                }, 100);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // React to theme context changes
    useEffect(() => {
        if (monacoRef.current) {
            applyTheme(monacoRef.current);
        }
    }, [theme, applyTheme]);

    // Cleanup Monaco instances on unmount
    useEffect(() => {
        return () => {
            if (monacoRef.current) {
                unregisterMonacoInstance(monacoRef.current);
            }
        };
    }, [unregisterMonacoInstance]);

    function checkDoubleClick() {
        if (editing) return;
        setEditing(true);
        onUpdateCell(cellId, { editing: true });
    }

    return (
        <div
            data-editing={editing}
            className="rounded-lg relative bg-card/40 dark:bg-card/20 border border-border/40 dark:border-border/30 shadow-sm hover:shadow-md transition-all duration-200 hover:border-border/60 dark:hover:border-border/50"
            onMouseEnter={() => setMouseHovered(true)}
            onMouseLeave={() => setMouseHovered(false)}
        >
            {/* Hover buttons */}
            {mouseHovered && (
                <div className="absolute flex justify-center items-center -top-3 right-3 z-10 bg-background/95 dark:bg-background/90 backdrop-blur-sm border border-border/60 rounded-md p-1 shadow-lg">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            const newEditing = !editing;
                            setEditing(newEditing);
                            onUpdateCell(cellId, { editing: newEditing });
                        }}
                        title={editing ? "Save changes" : "Edit cell"}
                    >
                        {editing ? <SquareCheckBig size={14} /> : <Edit size={14} />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteCell(cellId)}
                        title="Delete cell"
                    >
                        <Trash2 size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpand(!expand)}
                        className="h-7 w-7 p-0 hover:bg-accent/80"
                        title={expand ? "Collapse cell" : "Expand cell"}
                    >
                        {expand ? <ChevronsDownUpIcon size={14} /> : <ChevronsUpDown size={14} />}
                    </Button>
                </div>
            )}

            {editing ? (
                <div className="min-h-[60px] m-1 rounded-lg overflow-clip bg-background/80 dark:bg-background/60 border border-border/30">
                    <Editor
                        onMount={(editor, monaco) => {
                            // Store Monaco instance in ref
                            monacoRef.current = monaco;

                            monaco.editor.defineTheme(
                                "notebook",
                                notebookTheme as editor.IStandaloneThemeData
                            );

                            // Register with central theme manager
                            registerMonacoInstance(monaco);
                            applyTheme(monaco);

                            editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                                setEditing(false);
                                onUpdateCell(cellId, { editing: false });
                            });
                            editor.focus();
                        }}
                        onChange={(value) => {
                            onUpdateCell(cellId, { code: value || "" });
                        }}
                        height={
                            expand ? Math.max(cell.code.split("\n").length * 20, 60) :
                                (cell.code.split("\n").length > 15 ? 15 * 20 : Math.max((cell.code.split("\n").length) * 20, 60))
                        }
                        width="100%"
                        className="min-h-[60px] block font-btr-code overflow-y-clip !rounded-sm"
                        value={cell.code}
                        defaultValue={cell.code}
                        language={cell.type === "MARKDOWN" ? "markdown" : "latex"}
                        options={monacoConfig}
                    />
                    <div id={`status-${cellId}`} className="h-fit text-[10px] ml-10 grow z-20 w-fit bg-inherit text-left flex items-start justify-start"></div>
                </div>
            ) : (
                <div className="p-4 cursor-pointer hover:bg-accent/20 dark:hover:bg-accent/10 transition-colors rounded-lg" onClick={checkDoubleClick}>
                    {cell.type === "MARKDOWN" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {/* Simple markdown rendering - you might want to add a proper markdown renderer */}
                            <div className="whitespace-pre-wrap text-foreground/90">{cell.code}</div>
                        </div>
                    ) : (
                        <div className="latex">
                            {/* Simple latex rendering - you might want to add a proper latex renderer */}
                            <div className="whitespace-pre-wrap text-foreground/90 font-btr-code">{cell.code}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface CellUtilButtonsProps {
    defaultVisible?: boolean;
    position: number;
    addNewCell: (position?: number, type?: "CODE" | "MARKDOWN" | "LATEX") => void;
}

const CellUtilButtons: React.FC<CellUtilButtonsProps> = ({
    defaultVisible = false,
    position,
    addNewCell
}) => {
    const [visible, setVisible] = useState(defaultVisible);

    return (
        <div
            className="relative"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(defaultVisible)}
        >
            <div
                data-visible={visible}
                className="h-2.5 w-full mx-auto relative gap-3 text-center flex items-center text-muted-foreground z-10 overflow-visible text-xs justify-center data-[visible=true]:visible data-[visible=false]:invisible"
            >
                <div className="grow h-[1px] bg-border/60"></div>
                <div className="flex gap-2 bg-background/95 dark:bg-background/90 backdrop-blur-sm rounded-lg p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => addNewCell(position)}
                    >
                        + Code
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => addNewCell(position, "MARKDOWN")}
                    >
                        + Markdown
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-3 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => addNewCell(position, "LATEX")}
                    >
                        + LaTeX
                    </Button>
                </div>
                <div className="grow h-[1px] bg-border/60"></div>
            </div>
            <div
                data-visible={visible}
                className="h-[1px] w-[40px] mx-auto absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-border/40 data-[visible=true]:invisible"
            ></div>
        </div>
    );
};

export default function NotebookEditor() {
    const { activeProject, activeFile, actions: globalActions } = useGlobalState();
    const { projects, actions } = useProjects();
    const { theme } = useTheme();
    const settings = useSettings();
    const activeAddress = useActiveAddress();

    // Global Monaco instances registry for theme updates
    const monacoInstancesRef = useRef<Set<typeof import("monaco-editor")>>(new Set());

    // Register Monaco instance for theme updates
    const registerMonacoInstance = useCallback((monaco: typeof import("monaco-editor")) => {
        monacoInstancesRef.current.add(monaco);
    }, []);

    // Unregister Monaco instance
    const unregisterMonacoInstance = useCallback((monaco: typeof import("monaco-editor")) => {
        monacoInstancesRef.current.delete(monaco);
    }, []);

    // Apply theme to all Monaco instances
    const applyThemeToAll = useCallback(() => {
        const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        const themeName = isDark ? "notebook" : "vs-light";

        monacoInstancesRef.current.forEach(monaco => {
            try {
                monaco.editor.setTheme(themeName);
            } catch (error) {
                console.warn("Failed to set theme for Monaco instance:", error);
            }
        });
    }, [theme]);

    // Theme change listeners
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "vite-ui-theme") {
                setTimeout(() => {
                    const isDark = e.newValue === "dark" || (e.newValue === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                    const themeName = isDark ? "notebook" : "vs-light";

                    monacoInstancesRef.current.forEach(monaco => {
                        try {
                            monaco.editor.setTheme(themeName);
                        } catch (error) {
                            console.warn("Failed to set theme for Monaco instance:", error);
                        }
                    });
                }, 100);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // React to theme context changes
    useEffect(() => {
        applyThemeToAll();
    }, [applyThemeToAll]);

    const project = projects[activeProject];
    const file = project?.files[activeFile];

    // Convert file structure to notebook cells
    const getCells = (): { [key: string]: NotebookCell } => {
        if (!file) return {};

        const cells: { [key: string]: NotebookCell } = {};
        file.cellOrder.forEach(cellId => {
            const cellData = file.cells[cellId];
            if (cellData) {
                cells[cellId] = {
                    ...cellData,
                    code: cellData.content // Map content to code for compatibility
                };
            } else {
                // Fallback for files that don't have cells data yet
                cells[cellId] = {
                    id: cellId,
                    content: "",
                    code: "",
                    output: "",
                    type: "CODE",
                    editing: false
                };
            }
        });
        return cells;
    };

    const updateCell = (cellId: string, updates: Partial<NotebookCell>) => {
        if (!file || !project) return;

        const updatedFile = { ...file };

        // Ensure cells object exists
        if (!updatedFile.cells) {
            updatedFile.cells = {};
        }

        // Get current cell data or create new one
        const currentCell = updatedFile.cells[cellId] || {
            id: cellId,
            content: "",
            output: "",
            type: "CODE" as const,
            editing: false
        };

        // Update cell data
        const updatedCell = { ...currentCell };

        if (updates.code !== undefined) {
            updatedCell.content = updates.code;
        }

        if (updates.output !== undefined) {
            updatedCell.output = updates.output;
        }

        if (updates.type !== undefined) {
            updatedCell.type = updates.type;
        }

        if (updates.editing !== undefined) {
            updatedCell.editing = updates.editing;
        }

        if (updates.diffNew !== undefined) {
            updatedCell.diffNew = updates.diffNew;
        }

        // Update the cells object
        updatedFile.cells = {
            ...updatedFile.cells,
            [cellId]: updatedCell
        };

        actions.setFile(activeProject, updatedFile);
    };

    const deleteCell = (cellId: string) => {
        if (!file || !project) return;

        const updatedFile = { ...file };

        // Remove from cellOrder
        updatedFile.cellOrder = updatedFile.cellOrder.filter(id => id !== cellId);

        // cellContent has been removed from the interface

        // Remove from cells
        if (updatedFile.cells) {
            const newCells = { ...updatedFile.cells };
            delete newCells[cellId];
            updatedFile.cells = newCells;
        }

        actions.setFile(activeProject, updatedFile);
    };

    const runCell = async (cellId: string, code: string) => {
        console.log("Running cell:", cellId, "with code:", code);

        if (!code.trim()) {
            const errorMsg = "No code to execute";
            updateCell(cellId, { output: errorMsg });
            globalActions.setOutput(errorMsg);
            return;
        }

        if (!project?.process) {
            const errorMsg = "Error: No process ID found for this project. Please set a process ID in project settings.";
            updateCell(cellId, { output: errorMsg });
            globalActions.setOutput(errorMsg);
            toast.error("No process ID configured for this project");
            return;
        }

        // Clear previous output
        updateCell(cellId, { output: "" });
        globalActions.setOutput("");

        try {
            if (project.isMainnet) {
                // Mainnet execution
                if (!activeAddress) {
                    const errorMsg = "Error: Wallet connection required for mainnet execution";
                    updateCell(cellId, { output: errorMsg });
                    globalActions.setOutput(errorMsg);
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

                const parsedOutput = parseOutput(result);
                const hasError = isExecutionError(result);
                updateCell(cellId, {
                    output: parsedOutput
                });
                // Also update the global output state so it appears in the main editor's output tab
                globalActions.setOutput(parsedOutput);

                // Add to history
                globalActions.addHistoryEntry({
                    fileName: activeFile,
                    code: code,
                    output: parsedOutput,
                    projectId: activeProject,
                    isMainnet: true,
                    isError: hasError
                });

                // Show error toast if execution failed
                if (hasError) {
                    toast.error("Cell execution failed");
                }

                console.log("Mainnet execution completed:", result);

            } else {
                // Testnet execution - COMMENTED OUT
                // const signer = createAOSigner();
                // const ao = new TestnetAO({
                //     CU_URL: settings.actions.getCuUrl(),
                //     GATEWAY_URL: settings.actions.getGatewayUrl(),
                //     signer
                // });

                // updateCell(cellId, { output: "Running on testnet..." });

                // // For testnet, we'll use the write method with eval action
                // const tags = [
                //     { name: "Action", value: "Eval", get: () => "Eval" }
                // ] as any[];

                // const result = await ao.write({
                //     processId: project.process,
                //     tags: tags,
                //     data: code
                // });

                // updateCell(cellId, { 
                //     output: `Code executed successfully!\n\nMessage ID: ${result}\n\nCheck the process for results.`
                // });
                // console.log("Testnet execution completed:", result);

                updateCell(cellId, { output: "Testnet execution is currently disabled. Please use a mainnet project." });
                toast.error("Testnet execution is not available");
            }

        } catch (error) {
            const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
            console.error("Cell execution error:", errorMessage);
            updateCell(cellId, { output: errorMessage });
            globalActions.setOutput(errorMessage);
            toast.error("Failed to execute code");
        }
    };

    const addNewCell = (position?: number, type: "CODE" | "MARKDOWN" | "LATEX" = "CODE") => {
        if (!file || !project) return;

        if (typeof position === "undefined") position = file.cellOrder.length;

        const id = uuidv4();
        const defaultContent = type === "CODE"
            ? 'print("Hello AO!")'
            : type === "MARKDOWN"
                ? "# Hello AO!"
                : `The LaTeX cell supports adding Math equations through MathTex syntax

$$\\int_a^b f'(x) dx = f(b)- f(a)$$`;

        const updatedFile = { ...file };

        // Ensure cells object exists
        if (!updatedFile.cells) {
            updatedFile.cells = {};
        }

        // Create new cell
        const newCell: Cell = {
            id,
            content: defaultContent,
            output: "",
            type,
            editing: type !== "CODE" // Start editing for non-code cells
        };

        // Add to cells
        updatedFile.cells = {
            ...updatedFile.cells,
            [id]: newCell
        };

        // cellContent has been removed from the interface

        // Add to cellOrder at position
        updatedFile.cellOrder = [
            ...updatedFile.cellOrder.slice(0, position),
            id,
            ...updatedFile.cellOrder.slice(position)
        ];

        actions.setFile(activeProject, updatedFile);
    };

    if (!file || !activeFile) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                No notebook file selected
            </div>
        );
    }

    const cells = getCells();

    return (
        <div className="h-full w-full relative overflow-y-auto overflow-x-clip flex flex-col gap-4 p-6 bg-background/30 dark:bg-background/20">
            {file.cellOrder.map((cellId, index) => {
                const cell = cells[cellId];
                if (!cell) return null;

                return (
                    <React.Fragment key={cellId}>
                        <CellUtilButtons
                            position={index}
                            addNewCell={addNewCell}
                        />
                        {(cell.type === "MARKDOWN" || cell.type === "LATEX") ? (
                            <VisualCell
                                key={`visual-${cellId}-${cell.type}`}
                                file={file}
                                cellId={cellId}
                                project={project}
                                cell={cell}
                                onUpdateCell={updateCell}
                                onDeleteCell={deleteCell}
                                registerMonacoInstance={registerMonacoInstance}
                                unregisterMonacoInstance={unregisterMonacoInstance}
                            />
                        ) : (
                            <CodeCell
                                key={`code-${cellId}-${cell.type}`}
                                file={file}
                                cellId={cellId}
                                project={project}
                                cell={cell}
                                onUpdateCell={updateCell}
                                onDeleteCell={deleteCell}
                                onRunCell={runCell}
                                registerMonacoInstance={registerMonacoInstance}
                                unregisterMonacoInstance={unregisterMonacoInstance}
                            />
                        )}
                    </React.Fragment>
                );
            })}
            <CellUtilButtons
                position={file.cellOrder.length}
                addNewCell={addNewCell}
            />
        </div>
    );
}

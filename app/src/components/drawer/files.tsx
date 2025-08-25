import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects } from "@/hooks/use-projects"
import { Button } from "../ui/button"
import { toast } from "sonner"
import {
    PlusSquare,
    FileStack,
    FileText,
    File,
    FolderOpen,
    ChevronRight,
    ChevronDown,
    Edit3,
    Trash2,
    Copy,
    Download,
    MoreHorizontal,
    Plus
} from "lucide-react"
import { cn, getFileIcon } from "@/lib/utils"
import { useState } from "react"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "../ui/context-menu"
import { HOTKEYS, getHotkeyDisplay } from "@/lib/hotkeys"




export default function DrawerFiles() {
    const { activeFile, activeProject, actions } = useGlobalState()
    const { projects, actions: projectActions } = useProjects()
    const project = projects[activeProject]
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    // Note: No project handling is now done at the drawer level
    // This component will only render when a project is active
    if (!project) {
        return null
    }

    const files = Object.entries(project.files)

    const handleRenameClick = (fileName: string) => {
        // Set the active file to the one being renamed, then trigger the dialog
        actions.setActiveFile(fileName)
        const trigger = document.getElementById("rename-file")
        if (trigger) {
            trigger.click()
        }
    }

    const handleDeleteClick = (fileName: string) => {
        // Set the active file to the one being deleted, then trigger the dialog
        actions.setActiveFile(fileName)
        const trigger = document.getElementById("delete-file")
        if (trigger) {
            trigger.click()
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-3 py-2 border-b border-border/40 bg-sidebar/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {activeProject}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-accent"
                        onClick={() => {
                            // Trigger the new file dialog
                            const trigger = document.getElementById("new-file")
                            if (trigger) {
                                trigger.click()
                            }
                        }}
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* File list */}
            <div className="flex-1 overflow-y-auto">
                {files.length === 0 ? (
                    <div className="p-3 text-center">
                        <div className="text-xs text-muted-foreground mb-2">No files in project</div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1.5"
                            onClick={() => {
                                // Trigger the new file dialog
                                const trigger = document.getElementById("new-file")
                                if (trigger) {
                                    trigger.click()
                                }
                            }}
                        >
                            <PlusSquare className="w-3 h-3" />
                            New File
                        </Button>
                    </div>
                ) : (
                    <div className="py-1">
                        {files.map(([fileName, file]) => {
                            const { icon: FileIcon, className: iconClassName } = getFileIcon(fileName, 16)
                            const isActive = activeFile === fileName

                            return (
                                <ContextMenu key={fileName}>
                                    <ContextMenuTrigger asChild>
                                        <div
                                            className={cn(
                                                "group flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors",
                                                "hover:bg-accent/80",
                                                isActive && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => {
                                                actions.setActiveFile(fileName)
                                                actions.setActiveView(null)
                                            }}
                                        >
                                            <FileIcon className={cn(
                                                "w-4 h-4 flex-shrink-0",
                                                isActive ? iconClassName : iconClassName + " opacity-70"
                                            )} />
                                            <span className={cn(
                                                "truncate flex-1 text-xs",
                                                isActive ? "text-accent-foreground font-medium" : "text-foreground"
                                            )}>
                                                {fileName}
                                            </span>

                                            {/* File actions - shown on hover */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 w-5 p-0 hover:bg-muted"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        // Handle file menu
                                                    }}
                                                >
                                                    <MoreHorizontal className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent className="w-48">
                                        <ContextMenuItem
                                            onClick={() => {
                                                actions.setActiveFile(fileName)
                                                actions.setActiveView(null)
                                            }}
                                        >
                                            <FileText className="w-4 h-4" />
                                            Open File
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem
                                            onClick={() => handleRenameClick(fileName)}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Rename
                                            <ContextMenuShortcut>{getHotkeyDisplay(HOTKEYS.RENAME_FILE.key)}</ContextMenuShortcut>
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            onClick={() => {
                                                // Generate a unique name for the duplicate using timestamp
                                                const timestamp = Date.now()
                                                const lastDotIndex = fileName.lastIndexOf('.')
                                                const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName
                                                const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : ''

                                                // Check if the name already has a timestamp pattern (_numbers at the end)
                                                const timestampPattern = /_\d+$/
                                                const baseNameWithoutTimestamp = nameWithoutExt.replace(timestampPattern, '')

                                                const duplicateName = `${baseNameWithoutTimestamp}_${timestamp}${extension}`

                                                // Create duplicate file
                                                const originalFile = project.files[fileName]
                                                const duplicateFile = {
                                                    ...originalFile,
                                                    name: duplicateName,
                                                    // Generate new cell IDs to avoid conflicts
                                                    cellOrder: originalFile.cellOrder.map(cellId => `${cellId}-copy-${Date.now()}`),
                                                    cells: Object.fromEntries(
                                                        Object.entries(originalFile.cells).map(([cellId, cell]) => {
                                                            const newCellId = `${cellId}-copy-${Date.now()}`
                                                            return [newCellId, { ...cell, id: newCellId }]
                                                        })
                                                    )
                                                }

                                                projectActions.setFile(activeProject, duplicateFile)
                                                toast.success(`File duplicated as "${duplicateName}"`)
                                            }}
                                        >
                                            <Copy className="w-4 h-4" />
                                            Duplicate
                                            <ContextMenuShortcut>{getHotkeyDisplay(HOTKEYS.DUPLICATE_FILE.key)}</ContextMenuShortcut>
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            onClick={() => {
                                                const fileData = project.files[fileName]

                                                // Convert file content to downloadable format
                                                let content = ""
                                                let mimeType = "text/plain"

                                                if (fileName.endsWith('.luanb')) {
                                                    // For notebook files, export as JSON
                                                    content = JSON.stringify({
                                                        cells: fileData.cellOrder.map(cellId => ({
                                                            id: cellId,
                                                            type: fileData.cells[cellId].type.toLowerCase(),
                                                            content: fileData.cells[cellId].content,
                                                            output: fileData.cells[cellId].output
                                                        }))
                                                    }, null, 2)
                                                    mimeType = "application/json"
                                                } else {
                                                    // For other files, export cell content concatenated
                                                    content = fileData.cellOrder
                                                        .map(cellId => fileData.cells[cellId].content)
                                                        .join('\n\n')
                                                }

                                                // Create and trigger download
                                                const blob = new Blob([content], { type: mimeType })
                                                const url = URL.createObjectURL(blob)
                                                const link = document.createElement('a')
                                                link.href = url
                                                link.download = fileName
                                                link.click()
                                                URL.revokeObjectURL(url)

                                                toast.success(`File "${fileName}" downloaded successfully`)
                                            }}
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem
                                            variant="destructive"
                                            onClick={() => handleDeleteClick(fileName)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                            <ContextMenuShortcut>{getHotkeyDisplay(HOTKEYS.DELETE_FILE.key)}</ContextMenuShortcut>
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            )
                        })}
                    </div>
                )}
            </div>


        </div>
    )
}
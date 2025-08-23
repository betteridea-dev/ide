import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects } from "@/hooks/use-projects"
import { Button } from "../ui/button"
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
    ContextMenuTrigger,
} from "../ui/context-menu"



export default function DrawerFiles() {
    const { activeFile, activeProject, actions } = useGlobalState()
    const project = useProjects((p) => p.projects[activeProject])
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    // Note: No project handling is now done at the drawer level
    // This component will only render when a project is active
    if (!project) {
        return null
    }

    const files = Object.entries(project.files)

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
                        onClick={() => { }}
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
                            onClick={() => { }}
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
                                            onClick={() => {
                                                // Handle rename
                                                console.log('Rename file:', fileName)
                                            }}
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Rename
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            onClick={() => {
                                                // Handle duplicate
                                                console.log('Duplicate file:', fileName)
                                            }}
                                        >
                                            <Copy className="w-4 h-4" />
                                            Duplicate
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            onClick={() => {
                                                // Handle download
                                                console.log('Download file:', fileName)
                                            }}
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem
                                            variant="destructive"
                                            onClick={() => {
                                                // Handle delete
                                                console.log('Delete file:', fileName)
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
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
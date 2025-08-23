
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6"
import { Link } from "react-router"
import { Menubar as MainMenubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarSub, MenubarSubTrigger, MenubarSubContent } from "@/components/ui/menubar"
import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects, type Project } from "@/hooks/use-projects"
import { useState } from "react"
import { toast } from "sonner"
import NewProject from "./menubar/new-project"
import NewFile from "./menubar/new-file"

import {
    FileText,
    FolderPlus,
    FolderOpen,
    Copy,
    Edit3,
    Share,
    Trash2,
    Plus,
    X,
    Download,
    Upload,
    Settings,
    HelpCircle,
    Keyboard,
    Info,
    Eye,
    Layout,
    Palette,
    Save,
    FileUp,
    FileDown,
    Files,
    Blocks,
    Database,
    FlaskConical,
    Bot
} from "lucide-react"

const link = [
    {
        label: "Twitter",
        icon: FaXTwitter,
        link: "https://x.com/betteridea_dev"
    },
    {
        label: "GitHub",
        icon: FaGithub,
        link: "https://github.com/betteridea-dev"
    },
    {
        label: "Discord",
        icon: FaDiscord,
        link: "https://discord.gg/nm6VKUQBrA"
    }
]

export default function Menubar() {
    const { activeProject, activeFile, activeView, actions: globalActions } = useGlobalState()
    const { projects, actions: projectActions } = useProjects()
    const [isCreatingProject, setIsCreatingProject] = useState(false)

    const handleNewProject = () => {
        // Trigger the new project dialog
        const trigger = document.getElementById("new-project")
        if (trigger) {
            trigger.click()
        }
    }

    const handleOpenProject = () => {
        globalActions.setActiveView("project")
        globalActions.setActiveTab("files")
    }

    const handleNewFile = () => {
        // Trigger the new file dialog
        const trigger = document.getElementById("new-file")
        if (trigger) {
            trigger.click()
        }
    }

    const handleRenameProject = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }

        const newName = prompt("Enter new project name:", activeProject)
        if (newName && newName.trim() && newName.trim() !== activeProject) {
            const trimmedName = newName.trim()

            // Check if project with new name already exists
            if (projects[trimmedName]) {
                toast.error("Project with this name already exists")
                return
            }

            const project = projects[activeProject]
            if (project) {
                // Create new project with new name
                const renamedProject = { ...project, name: trimmedName }
                projectActions.setProject(renamedProject)

                // Delete old project
                projectActions.deleteProject(activeProject)

                // Update active project
                globalActions.setActiveProject(trimmedName)

                // Update recents
                projectActions.removeRecent(activeProject)
                projectActions.addRecent(trimmedName)

                toast.success(`Project renamed to "${trimmedName}"`)
            }
        }
    }

    const handleDuplicateProject = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }

        const newName = prompt("Enter name for duplicated project:", `${activeProject} (Copy)`)
        if (newName && newName.trim()) {
            const trimmedName = newName.trim()

            // Check if project with new name already exists
            if (projects[trimmedName]) {
                toast.error("Project with this name already exists")
                return
            }

            const project = projects[activeProject]
            if (project) {
                const duplicatedProject = {
                    ...project,
                    name: trimmedName,
                    process: "" // Reset process for duplicated project
                }
                projectActions.setProject(duplicatedProject)
                toast.success(`Project duplicated as "${trimmedName}"`)
            }
        }
    }

    const handleShareProject = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }

        // For now, just copy project data to clipboard as JSON
        const project = projects[activeProject]
        if (project) {
            const shareData = JSON.stringify(project, null, 2)
            navigator.clipboard.writeText(shareData).then(() => {
                toast.success("Project data copied to clipboard")
            }).catch(() => {
                toast.error("Failed to copy to clipboard")
            })
        }
    }

    const handleCloseProject = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }

        globalActions.closeProject()
        toast.success(`Project "${activeProject}" closed`)
    }

    const handleDeleteProject = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }

        const confirmation = confirm(`Are you sure you want to delete project "${activeProject}"? This action cannot be undone.`)
        if (confirmation) {
            projectActions.deleteProject(activeProject)
            projectActions.removeRecent(activeProject)
            globalActions.closeProject()
            toast.success(`Project "${activeProject}" deleted`)
        }
    }

    const handleImportProject = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    try {
                        const projectData = JSON.parse(e.target?.result as string)
                        // TODO: Validate project structure
                        projectActions.setProject(projectData)
                        toast.success(`Project "${projectData.name}" imported successfully`)
                    } catch (error) {
                        toast.error("Invalid project file format")
                    }
                }
                reader.readAsText(file)
            }
        }
        input.click()
    }

    const handleExportProject = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }

        const project = projects[activeProject]
        if (project) {
            const dataStr = JSON.stringify(project, null, 2)
            const dataBlob = new Blob([dataStr], { type: 'application/json' })
            const url = URL.createObjectURL(dataBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${activeProject}.json`
            link.click()
            URL.revokeObjectURL(url)
            toast.success(`Project "${activeProject}" exported successfully`)
        }
    }

    const handleRenameFile = () => {
        if (!activeProject || !activeFile) {
            toast.error("No file selected")
            return
        }

        // Extract name without extension for the prompt
        const lastDotIndex = activeFile.lastIndexOf('.')
        const nameWithoutExt = lastDotIndex > 0 ? activeFile.substring(0, lastDotIndex) : activeFile
        const extension = lastDotIndex > 0 ? activeFile.substring(lastDotIndex) : ''

        const newName = prompt("Enter new file name:", nameWithoutExt)
        if (newName && newName.trim() && newName.trim() !== nameWithoutExt) {
            const trimmedName = newName.trim()

            // Determine final file name
            let finalName: string
            if (trimmedName.includes('.')) {
                // User provided extension, use as-is
                finalName = trimmedName
            } else {
                // No extension provided, preserve original extension
                finalName = trimmedName + extension
            }

            // Check if file with new name already exists
            if (projects[activeProject]?.files[finalName]) {
                toast.error("File with this name already exists")
                return
            }

            const project = projects[activeProject]
            if (project) {
                // Create new file with new name
                const fileData = project.files[activeFile]
                const renamedFile = { ...fileData, name: finalName }

                // Add new file and delete old one
                projectActions.setFile(activeProject, renamedFile)
                projectActions.deleteFile(activeProject, activeFile)

                // Update opened files and active file if this file was opened
                globalActions.renameOpenedFile(activeFile, finalName)

                toast.success(`File renamed to "${finalName}"`)
            }
        }
    }

    const handleDuplicateFile = () => {
        if (!activeProject || !activeFile) {
            toast.error("No file selected")
            return
        }

        const project = projects[activeProject]
        if (project) {
            // Generate a unique name for the duplicate
            let duplicateName = `${activeFile} (Copy)`
            let counter = 1

            // Keep incrementing until we find a unique name
            while (project.files[duplicateName]) {
                counter++
                duplicateName = `${activeFile} (Copy ${counter})`
            }

            // Create duplicate file
            const originalFile = project.files[activeFile]
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
        }
    }

    const handleDeleteFile = () => {
        if (!activeProject || !activeFile) {
            toast.error("No file selected")
            return
        }
        const confirmation = confirm(`Are you sure you want to delete "${activeFile}"? This action cannot be undone.`)
        if (confirmation) {
            // Delete the file
            projectActions.deleteFile(activeProject, activeFile)

            // Close the file if it's currently opened in editor
            globalActions.closeOpenedFile(activeFile)

            toast.success(`File "${activeFile}" deleted successfully`)
        }
    }

    const handleSaveProject = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }
        // TODO: Implement save logic
        toast.success(`Project "${activeProject}" saved`)
    }

    const handleSettings = () => {
        globalActions.setActiveView("settings")
    }

    const handleShowKeyboardShortcuts = () => {
        // TODO: Implement keyboard shortcuts modal
        toast.info("Keyboard shortcuts panel coming soon!")
    }

    const handleShowAbout = () => {
        // TODO: Implement about modal
        toast.info("About BetterIDEa coming soon!")
    }

    return <div className="h-[25px] flex items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pr-2">
        <Link to="https://betteridea.dev" target="_blank" className="h-full w-10 hover:bg-accent/80 flex items-center justify-center transition-colors">
            <img src="/icon.svg" alt="logo" className="w-6 h-6 p-0.5 pl-1" />
        </Link>

        {/* Main Menubar */}
        <MainMenubar className="h-[24px] border-none shadow-none bg-transparent p-0">
            {/* File Menu - Project-level operations */}
            <MenubarMenu>
                <MenubarTrigger className="h-[24px] px-2 py-0 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-colors">
                    File
                </MenubarTrigger>
                <MenubarContent sideOffset={0} alignOffset={0} className="min-w-[180px] bg-popover supports-[backdrop-filter]:bg-popover border-border shadow-md">
                    <MenubarItem
                        onClick={handleNewProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        <FolderPlus className="w-4 h-4 text-muted-foreground" />
                        New Project
                        <MenubarShortcut className="text-muted-foreground">⌘N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem
                        onClick={handleOpenProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        Open Project
                        <MenubarShortcut className="text-muted-foreground">⌘O</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={handleSaveProject}
                        disabled={!activeProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4 text-muted-foreground" />
                        Save Project
                        <MenubarShortcut className="text-muted-foreground">⌘S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={handleImportProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        <FileUp className="w-4 h-4 text-muted-foreground" />
                        Import Project
                    </MenubarItem>
                    <MenubarItem
                        onClick={handleExportProject}
                        disabled={!activeProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <FileDown className="w-4 h-4 text-muted-foreground" />
                        Export Project
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={handleCloseProject}
                        disabled={!activeProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <X className="w-4 h-4 text-muted-foreground" />
                        Close Project
                        <MenubarShortcut className="text-muted-foreground">⌘W</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            {/* Edit Menu - File-level operations */}
            <MenubarMenu>
                <MenubarTrigger className="h-[24px] px-2 py-0 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-colors">
                    Edit
                </MenubarTrigger>
                <MenubarContent sideOffset={0} alignOffset={0} className="min-w-[180px] bg-popover supports-[backdrop-filter]:bg-popover border-border shadow-md">
                    <MenubarItem
                        onClick={handleNewFile}
                        disabled={!activeProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4 text-muted-foreground" />
                        New File
                        <MenubarShortcut className="text-muted-foreground">⌘⇧N</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={handleRenameFile}
                        disabled={!activeProject || !activeFile}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                        Rename File
                        <MenubarShortcut className="text-muted-foreground">F2</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem
                        onClick={handleDuplicateFile}
                        disabled={!activeProject || !activeFile}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                        Duplicate File
                        <MenubarShortcut className="text-muted-foreground">⌘D</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={handleDeleteFile}
                        disabled={!activeProject || !activeFile}
                        variant="destructive"
                        className="gap-2 cursor-pointer focus:bg-destructive/10 focus:text-destructive data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed dark:focus:bg-destructive/20"
                    >
                        <Trash2 className="w-4 h-4 text-destructive" />
                        Delete File
                        <MenubarShortcut className="text-muted-foreground">Del</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            {/* Project Menu - Project management operations */}
            <MenubarMenu>
                <MenubarTrigger className="h-[24px] px-2 py-0 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-colors">
                    Project
                </MenubarTrigger>
                <MenubarContent sideOffset={0} alignOffset={0} className="min-w-[180px] bg-popover supports-[backdrop-filter]:bg-popover border-border shadow-md">
                    <MenubarItem
                        onClick={handleRenameProject}
                        disabled={!activeProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                        Rename Project
                    </MenubarItem>
                    <MenubarItem
                        onClick={handleDuplicateProject}
                        disabled={!activeProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                        Duplicate Project
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={handleShareProject}
                        disabled={!activeProject}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                    >
                        <Share className="w-4 h-4 text-muted-foreground" />
                        Share Project
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={handleDeleteProject}
                        disabled={!activeProject}
                        variant="destructive"
                        className="gap-2 cursor-pointer focus:bg-destructive/10 focus:text-destructive data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed dark:focus:bg-destructive/20"
                    >
                        <Trash2 className="w-4 h-4 text-destructive" />
                        Delete Project
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>



            {/* Help Menu - Documentation and support */}
            <MenubarMenu>
                <MenubarTrigger className="h-[24px] px-2 py-0 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-colors">
                    Help
                </MenubarTrigger>
                <MenubarContent sideOffset={0} alignOffset={0} className="min-w-[180px] bg-popover supports-[backdrop-filter]:bg-popover border-border shadow-md">
                    <MenubarItem
                        onClick={handleShowKeyboardShortcuts}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        <Keyboard className="w-4 h-4 text-muted-foreground" />
                        Keyboard Shortcuts
                        <MenubarShortcut className="text-muted-foreground">⌘K ⌘S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={() => window.open('https://docs.betteridea.dev', '_blank')}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        Documentation
                    </MenubarItem>
                    <MenubarSeparator className="bg-border" />
                    <MenubarItem
                        onClick={handleShowAbout}
                        className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground"
                    >
                        <Info className="w-4 h-4 text-muted-foreground" />
                        About BetterIDEa
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </MainMenubar>

        {/* hidden menubar items with actual functionality */}
        {/* all other buttons will be a proxy to these items */}
        <div className="">
            <NewProject />
            <NewFile />
        </div>


        <div className="grow"></div>
        {link.map((item, index) => (
            <Link key={index} to={item.link} target="_blank" className="h-full w-6 hover:bg-accent/80 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground">
                <item.icon size={16} />
            </Link>
        ))}
    </div>
}
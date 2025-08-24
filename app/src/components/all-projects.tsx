import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects } from "@/hooks/use-projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    FileCodeIcon,
    FolderIcon,
    CalendarIcon,
    UserIcon,
    ArrowLeftIcon,
    PlusIcon,
    TrashIcon,
    ExternalLinkIcon
} from "lucide-react"

export default function AllProjects() {
    const globalState = useGlobalState()
    const projects = useProjects()

    const handleOpenProject = (projectName: string) => {
        try {
            const project = projects.projects[projectName]
            if (project) {
                globalState.actions.setActiveProject(projectName)
                const firstFile = Object.keys(project.files)[0]
                if (firstFile) {
                    globalState.actions.setActiveFile(firstFile)
                    globalState.actions.setActiveView(null)
                } else {
                    globalState.actions.setActiveView(null)
                }
                projects.actions.addRecent(projectName)
            }
        } catch (e) {
            console.error("Failed to open project:", e)
        }
    }

    const handleDeleteProject = (projectName: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm(`Are you sure you want to delete project "${projectName}"?`)) {
            projects.actions.deleteProject(projectName)
            projects.actions.removeRecent(projectName)
        }
    }

    const handleNewProject = () => {
        // Trigger the new project dialog
        const trigger = document.getElementById("new-project")
        if (trigger) {
            trigger.click()
        }
    }

    const handleBackToWelcome = () => {
        globalState.actions.setActiveView(null)
        globalState.actions.setActiveProject("")
        globalState.actions.setActiveFile("")
    }

    const projectList = Object.entries(projects.projects)
    const recentProjects = projects.recents || []

    return (
        <div className="p-6 h-full overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToWelcome}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeftIcon size={16} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">All Projects</h1>
                        <p className="text-muted-foreground">
                            {projectList.length} project{projectList.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                </div>
                <Button onClick={handleNewProject} className="gap-2">
                    <PlusIcon size={16} />
                    New Project
                </Button>
            </div>

            {projectList.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <FolderIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Create your first project to get started with ao development
                        </p>
                        <Button onClick={handleNewProject} className="gap-2">
                            <PlusIcon size={16} />
                            Create Project
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <FolderIcon size={18} className="text-primary" />
                        All Projects
                    </h2>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {projectList.map(([projectName, project]) => {
                            const fileCount = Object.keys(project.files).length
                            const isRecent = recentProjects.includes(projectName)

                            return (
                                <Card
                                    key={projectName}
                                    className="cursor-pointer hover:shadow-md transition-shadow group"
                                    onClick={() => handleOpenProject(projectName)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <FolderIcon size={16} className="text-primary flex-shrink-0" />
                                                <CardTitle className="text-sm truncate">{projectName}</CardTitle>
                                                {isRecent && (
                                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                        Recent
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={(e) => handleDeleteProject(projectName, e)}
                                            >
                                                <TrashIcon size={12} />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <FileCodeIcon size={12} />
                                                    {fileCount} file{fileCount !== 1 ? 's' : ''}
                                                </div>
                                                {project.isMainnet && (
                                                    <div className="flex items-center gap-1">
                                                        <ExternalLinkIcon size={12} />
                                                        Mainnet
                                                    </div>
                                                )}
                                            </div>
                                            {project.ownerAddress && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <UserIcon size={12} />
                                                    <span className="truncate font-mono">
                                                        {project.ownerAddress.slice(0, 8)}...{project.ownerAddress.slice(-4)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

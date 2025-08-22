import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects } from "@/hooks/use-projects"
import { useState } from "react"
import {
    FileCodeIcon,
    FileStack,
    PlusSquare,
    NewspaperIcon,
    CodeIcon,
    TerminalIcon,
    BookOpenIcon,
    RocketIcon,
    SparklesIcon,
    GithubIcon,
    Cannabis
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router"
import { ConnectButton, useConnection } from "@arweave-wallet-kit/react"

const emoticons = [
    "(^･o･^)ﾉ' ",
    "ฅ^•ﻌ•^ฅ",
    "(⁠ ⁠╹⁠▽⁠╹⁠ ⁠)",
    "(⁠≧⁠▽⁠≦⁠)",
    "<⁠(⁠￣⁠︶⁠￣⁠)⁠>",
    "＼⁠(⁠^⁠o⁠^⁠)⁠／",
    "/⁠ᐠ⁠｡⁠ꞈ⁠｡⁠ᐟ⁠\\",
    "▼⁠・⁠ᴥ⁠・⁠▼",
    "〜⁠(⁠꒪⁠꒳⁠꒪⁠)⁠〜",
    "ᕙ⁠(⁠ ⁠ ⁠•⁠ ⁠‿⁠ ⁠•⁠ ⁠ ⁠)⁠ᕗ"
]

const learningResources = [
    {
        title: "AO Cookbook",
        icon: BookOpenIcon,
        link: "https://cookbook_ao.ar.io",
    },
    {
        title: "Hyperbeam Docs",
        icon: FileCodeIcon,
        link: "https://hyperbeam.ar.io",
    },
    {
        title: "LLM Fuel",
        icon: Cannabis,
        link: "https://fuel_permawebllms.arweave.net/",
    }
]

export default function Welcome() {
    const globalState = useGlobalState()
    const projects = useProjects()
    const [randomWord] = useState(() => emoticons[Math.floor(Math.random() * emoticons.length)])
    const { connected } = useConnection()

    const handleQuickAction = (action: string) => {
        switch (action) {
            case "new-project":
                // Trigger new project creation - this would typically open a modal
                console.log("Create new project")
                break
            case "all-projects":
                globalState.actions.setActiveView("project")
                break
            case "terminal":
                // Open interact tab (closest to terminal functionality)
                globalState.actions.setActiveTab("interact")
                break
        }
    }

    const openRecentProject = (projectName: string) => {
        try {
            const project = projects.projects[projectName]
            if (project) {
                globalState.actions.setActiveProject(projectName)
                const firstFile = Object.keys(project.files)[0]
                if (firstFile) {
                    globalState.actions.setActiveFile(firstFile)
                    globalState.actions.setActiveView(null)
                } else {
                    globalState.actions.setActiveView("project")
                }
                projects.actions.addRecent(projectName)
            }
        } catch (e) {
            console.error("Failed to open project:", e)
        }
    }

    return (
        <div className="p-5 text-foreground overflow-scroll h-full flex flex-col justify-center">
            {/* Hero Section - Outside Grid */}
            <div className="mt-auto ml-18">
                <h1 className="text-6xl font-bold mb-2" suppressHydrationWarning>
                    BetterIDEa
                </h1>
                <p className="text-lg">
                    <span className="text-primary font-medium">ao&apos;s</span> development environment. {randomWord}
                </p>
            </div>

            {/* 2x2 Grid Content */}
            <div className="grid grid-cols-2 gap-8 max-w-4xl my-auto items-start justify-start ml-20">

                {/* Top Left - Quick Actions */}
                <div className="flex flex-col">
                    <div className="flex flex-col gap-1 -ml-3">
                        {/* {quickActions.map((action) => (
                            <Button
                                key={action.action}
                                variant="link"
                                className="justify-start items-start h-7 text-foreground/90 gap-2 px-0"
                                onClick={() => handleQuickAction(action.action)}
                            >
                                <action.icon size={18} /> {action.title}
                            </Button>
                        ))} */}
                        <Button variant="link" className="justify-center w-fit items-center h-7 text-foreground gap-2 px-0" onClick={() => handleQuickAction("new-project")}>
                            <PlusSquare size={18} /> New Project
                        </Button>
                        <Button variant="link" className="justify-center w-fit items-center h-7 text-foreground gap-2 px-0" onClick={() => handleQuickAction("all-projects")}>
                            <FileStack size={18} /> All Projects
                        </Button>
                        {!connected && <ConnectButton className="!rounded-md !w-fit !p-0 !bg-primary ml-3 mt-4" />}
                    </div>
                </div>

                {/* Top Right - Learning Resources */}
                <div className="flex flex-col">
                    <h3 className="font-medium text-foreground mb-3">Learning Resources</h3>
                    <div className="space-y-1">
                        {learningResources.map((resource, i) => (
                            <Link
                                to={resource.link}
                                target="_blank"
                                key={i}
                                className="px-2 py-1.5 block rounded hover:bg-muted/30 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-2">
                                    <resource.icon
                                        size={16}
                                        className={`group-hover:scale-105 transition-transform opacity-70 text-primary`}
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm text-foreground">{resource.title}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Bottom Left - Recent Projects */}
                <div className="flex flex-col">
                    <h3 className="font-medium text-foreground mb-3">Recent Projects</h3>
                    <div className="space-y-1">
                        {projects.recents && projects.recents.length > 0 ? (
                            projects.recents.slice(0, 5).map((projectName, i) => (
                                <Button
                                    key={i}
                                    variant="link"
                                    className="flex h-7 gap-2 px-1 justify-start text-foreground tracking-wide"
                                    onClick={() => openRecentProject(projectName)}
                                >
                                    <FileCodeIcon size={16} className="text-primary" />
                                    <span className="text-sm">{projectName}</span>
                                </Button>
                            ))
                        ) : (
                            <div className="text-sm text-foreground px-2">No recent projects</div>
                        )}
                    </div>
                </div>

                {/* Bottom Right - Quick Tips */}
                <div className="flex flex-col">
                    <h3 className="font-medium text-foreground mb-3">Quick Tips</h3>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 px-2 py-1">
                            <SparklesIcon size={12} className="text-primary opacity-60" />
                            <span className="text-xs text-foreground">Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+N</kbd> to create a new project</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1">
                            <SparklesIcon size={12} className="text-primary opacity-60" />
                            <span className="text-xs text-foreground">Use the terminal tab for interactive ao development</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1">
                            <SparklesIcon size={12} className="text-primary opacity-60" />
                            <span className="text-xs text-foreground">Check out the examples to get started quickly</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Centered Footer */}
            <div className="text-center py-4 mt-auto">
                <p className="text-xs text-muted-foreground">
                    Built with ❤️ for the permaweb
                </p>
            </div>
        </div>
    )
}
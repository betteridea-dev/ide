import { useGlobalState, useProjectManager, useWallet } from "@/hooks"
import { TView } from "."
import { toast } from "sonner"
import Link from "next/link"
import { useLocalStorage } from "usehooks-ts"
import { useEffect, useState } from "react"
import { AlertTriangleIcon, FileCodeIcon, FileStack, ImportIcon, InfoIcon, NewspaperIcon, PartyPopper, PlusSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { pushToRecents } from "@/lib/utils"

const words = [
    "(^･o･^)ﾉ' ",
    "ฅ^•ﻌ•^ฅ",
    "(⁠ ⁠╹⁠▽⁠╹⁠ ⁠)",
    "(⁠≧⁠▽⁠≦⁠)",
    "<⁠(⁠￣⁠︶⁠￣⁠)⁠>",
    "＼⁠(⁠^⁠o⁠^⁠)⁠／",
    "/⁠ᐠ⁠｡⁠ꞈ⁠｡⁠ᐟ⁠\\",
    "/⁠╲⁠/⁠\\⁠╭⁠(⁠•⁠‿⁠•⁠)⁠╮⁠/⁠\⁠\╱⁠\\",
    "▼⁠・⁠ᴥ⁠・⁠▼",
    "〜⁠(⁠꒪⁠꒳⁠꒪⁠)⁠〜",
    "(⁠⁠‾⁠▿⁠‾⁠)⁠",
    "\⁠(⁠ϋ⁠)⁠/⁠♩",
    "ᕙ⁠(⁠ ⁠ ⁠•⁠ ⁠‿⁠ ⁠•⁠ ⁠ ⁠)⁠ᕗ",
    "ᕙ⁠(⁠ ͡⁠°⁠ ͜⁠ʖ⁠ ͡⁠°⁠)⁠ᕗ",
    "⁄⁠(⁠⁄⁠ ⁠⁄⁠•⁠⁄⁠-⁠⁄⁠•⁠⁄⁠ ⁠⁄⁠)⁠⁄"
]

const published = [
    {
        title: "Installing Packages",
        desc: "Learn how to use APM and install packages on processes",
        link: "https://mirror.xyz/0xCf673b87aFBed6091617331cC895376209d3b923/M4XoQFFCAKBH54bwIsCFT3Frxd575-plCg2o4H1Tujs"
    },
    {
        title: "Portable Codecells",
        desc: "Learn how to integrate our codecells into your webapps",
        link: "https://youtu.be/e7Gx2NdWXLQ?si=hg8Ih7828AsVjpp7"
    },
    {
        title: "Unit Testing",
        desc: "Try writing unit tests for your AO functions",
        link: "https://mirror.xyz/0xCf673b87aFBed6091617331cC895376209d3b923/uBgGB-HNhlig7RucAzdSyRjJIJSXCug5NMgN7bXS9qk"
    },
    {
        title: "BetterIDEa graphs",
        desc: "Fetch and plot live crypto prices data using 0rbit oracle and BetterIDEa graphs",
        link: "https://ide.betteridea.dev/import?id=2voE0ERMT6CCPRVEkTsotDR-dmHgfoSH6dvucL9rSQc"
    }
]

function Home() {
    const wallet = useWallet()
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [recents, setRecents] = useLocalStorage("recents", [], { initializeWithValue: true });
    const [showUpdates, setShowUpdates] = useState(false);

    function openRecent(pname: string) {
        try {
            globalState.setActiveProject(pname)
            globalState.setActiveFile(Object.keys(manager.projects[pname].files)[0])
            globalState.setActiveView("EDITOR")
            pushToRecents(pname)
        } catch (e) {
            globalState.setActiveProject(null)
            globalState.setActiveFile(null)
            globalState.setActiveView(null)
            toast.error("Project not found")
        }
    }

    return <div className="p-5 text-foreground/90 overflow-scroll grid grid-cols-1 md:grid-cols-2 md:gap-5 ring-foreground h-full w-full items-start justify-start">

        <div className="absolute bottom-6 z-20 mx-auto w-fit ring-destructive-foreground bg-destructive text-destructive-foreground p-1 px-3 rounded-md left-0 right-0 flex gap-2 items-center cursor-pointer" onMouseOver={() => setShowUpdates(true)} onMouseLeave={() => setShowUpdates(false)}><InfoIcon size={17} />UPDATES</div>

        {showUpdates && <div className="absolute left-0 top-0 right-0 bottom-5 w-full m-1 bg-background/50 gap-5 font-bold pointer-events-none mx-auto">
            <div className="absolute bottom-10 left-0 right-0 w-1/2 bg-destructive p-3 text-sm rounded-md mx-auto ring- ring-destructive-foreground flex flex-col items-start justify-center gap-2">
                <div className="flex gap-2 items-center text-destructive-foreground">
                    <div>
                        <AlertTriangleIcon />
                    </div>
                    We did a major codebase and UI overhaul. Please report any bugs you encounter on our discord server
                </div>
                <div className="flex gap-2 items-center text-destructive-foreground">
                    <div>
                        <AlertTriangleIcon />
                    </div>
                    If you had notebook files which have become normal files now, please change their filename to .luanb extension
                </div>
                {/* <div className="flex gap-2 items-center text-destructive-foreground">
                    <div>
                    <AlertTriangleIcon />
                    </div>
                    Old processes must perform a security update (settings &gt; patch 6-5-24): only for processes spawned prior to AOS 1.11.0
                </div> */}
                <div className="flex gap-2 items-center">
                    <div><PartyPopper /></div>
                    All new processes will be spawned with WASM64 support!
                </div>
            </div>

        </div>}

        <div className="flex flex-col gap-5 items-start md:h-2/3 my-auto md:ml-16">
            <h1 className="text-6xl font-bold" suppressHydrationWarning>BetterIDEa</h1>

            <p className="text-lg">
                <span className="text-primary font-medium">ao&apos;s</span> development environment. {
                    words[Math.floor(Math.random() * words.length)]
                }
            </p>

            {!wallet.isConnected && <Button onClick={() => document.getElementById("connect-btn")?.click()}>Connect Wallet</Button>}

            <div className="flex flex-col text-left my-6 gap-1">
                <Button variant="link" className="justify-start items-start h-7 text-foreground/90 gap-1 px-0" onClick={() => document.getElementById("all-projects")?.click()}>
                    <FileStack size={20} /> All Projects
                </Button>
                <Button variant="link" className="justify-start items-start h-7 text-foreground/90 gap-1 px-0" onClick={() => document.getElementById("new-project")?.click()}>
                    <PlusSquare size={20} /> New Project
                </Button>
                {/* <Button variant="link" className="justify-start h-7 text-foreground/90 gap-1 px-0" disabled>
                        <ImportIcon size={20} /> Import from Protocol.Land
                    </Button> */}

                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger className=" w-fit">
                            <Button variant="link" disabled className="justify-start items-start h-7 text-foreground/90 gap-1 px-0">
                                <ImportIcon size={20} /> Import from Protocol.Land
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-primary text-background font-medium">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm">Coming soon...</span>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <details open className="w-full">
                    <summary className="font-medium mt-5 my-3 cursor-pointer"><span className="pl-6">Recent Projects</span></summary>
                    <div className="pl-8">
                        {
                            recents.toReversed().map((pname, i) => <Button key={i} variant="link" className="flex h-7 gap-2 px-1 justify-start text-foreground/90 tracking-wide"
                                onClick={() => openRecent(pname)}
                            >
                                <FileCodeIcon size={18} />
                                <span className="">{pname}</span>
                            </Button>)
                        }
                        {recents.length === 0 && <div className="text-sm text-foreground/60">No recent projects</div>}
                    </div>
                </details>
                {/* <Button variant="link" className="justify-start h-7 ring-1 text-foreground/90 gap-1 px-0">
                        <FolderOpen size={20} /> Open Existing
                    </Button> */}
            </div>
            {/* <div className="md:absolute bottom-20 flex gap-5">
                    <Link href="https://discord.gg/nm6VKUQBrA" target="_blank" className="hover:scale-150 transition-all duration-150">
                        <FaDiscord size={25} />
                    </Link>
                    <Link href="https://x.com/betteridea_dev" target="_blank" className="hover:scale-150 transition-all duration-150">
                        <FaTwitter size={25} />
                    </Link>
                    <Link href="https://github.com/betteridea-dev" target="_blank" className="hover:scale-150 transition-all duration-150">
                        <FaGithub size={25} />
                    </Link>
                </div> */}
            {/* <div>Latest content</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <ContentItem title="Installing Packages" desc="Learn how to use APM and install packages on processes" link="https://mirror.xyz/0xCf673b87aFBed6091617331cC895376209d3b923/M4XoQFFCAKBH54bwIsCFT3Frxd575-plCg2o4H1Tujs" />
                    <ContentItem title="Portable Codecells" desc="Learn how to integrate our codecells into your webapps" link="https://youtu.be/e7Gx2NdWXLQ?si=hg8Ih7828AsVjpp7" />
                    <ContentItem title="Unit Testing" desc="Try writing unit tests for your AO functions" link="https://mirror.xyz/0xCf673b87aFBed6091617331cC895376209d3b923/uBgGB-HNhlig7RucAzdSyRjJIJSXCug5NMgN7bXS9qk" />
                    <ContentItem title="BetterIDEa graphs" desc="Fetch and plot live crypto prices data using 0rbit oracle and BetterIDEa graphs" link="https://ide.betteridea.dev/import?id=2voE0ERMT6CCPRVEkTsotDR-dmHgfoSH6dvucL9rSQc"/>
                </div> */}
        </div>
        <div className="p-5  overflow-scroll md:h-1/2 my-auto justify-start items-start">
            {/* <details open>
                    <summary className="font-medium mb-2"><span className="pl-4">Recent Projects</span></summary>
                    <div className="pl-5">
                        {
                            recents.toReversed().map((pname, i) => <Button key={i} variant="link" className="flex h-7 gap-2 px-1 justify-start text-foreground/90 tracking-wide"
                                onClick={() => document.getElementById(pname)?.click()}
                            >
                                <FileCodeIcon size={18} />
                                <span className="">{pname}</span>
                            </Button>)
                        }
                        {recents.length === 0 && <div className="text-sm text-foreground/60">No recent projects</div>}
                    </div>
                </details> */}
            <details open className="-ml-5 mb-auto">
                <summary className="font-medium mb-4 cursor-pointer"><span className="ml-6">Freshly Published</span></summary>
                <div className="pl-8 flex flex-col gap-3 overflow-scroll">
                    {
                        published.map((post, i) =>
                            <Link href={post.link} target="_blank" key={i}><Button variant="link" className="flex gap-2 px-1 justify-start text-foreground/90 tracking-wide">
                                <div><NewspaperIcon size={18} /></div>
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{post.title}</span>
                                    <span className="font-light text-sm">{post.desc}</span>
                                </div>
                            </Button></Link>)
                    }
                </div>
            </details>
        </div>
    </div>
}

const viewItem: TView = {
    component: Home,
    label: "Home",
    value: null
}

export default viewItem;
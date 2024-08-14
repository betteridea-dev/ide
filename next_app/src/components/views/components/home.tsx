import { useGlobalState, useProfile, useProjectManager, useWallet } from "@/hooks"
import { TView } from "."
import { toast } from "sonner"
import Link from "next/link"
import { useLocalStorage } from "usehooks-ts"
import { useEffect, useState } from "react"
import { AlertTriangleIcon, FileCodeIcon, FileStack, ImportIcon, InfoIcon, NewspaperIcon, PartyPopper, PlusSquare, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { pushToRecents } from "@/lib/utils"
import { getProfileByWalletAddress } from "@/lib/bazar"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

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
    const profile = useProfile()
    const [recents, setRecents] = useLocalStorage("recents", [], { initializeWithValue: true });
    const [showUpdates, setShowUpdates] = useState(false);

    useEffect(() => {
        profile.setLoading(true)
        async function fetchProfile() {
            if (!wallet.address) return
            const res = await getProfileByWalletAddress({ address: wallet.address })
            profile.setProfile(res)
            profile.setLoading(false)
        }
        fetchProfile()
    }, [wallet.address])

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

    return <div className="p-5 text-foreground/90 overflow-scroll grid grid-cols-1 md:grid-cols-2 md:gap-5 h-[calc(100vh-50px)] items-center justify-center ring-1">

        {/* <div className="absolute bottom-6 z-20 mx-auto w-fit ring-destructive-foreground bg-destructive text-destructive-foreground p-1 px-3 rounded-md left-0 right-0 flex gap-2 items-center cursor-pointer" onMouseOver={() => setShowUpdates(true)} onMouseLeave={() => setShowUpdates(false)}><InfoIcon size={17} />UPDATES</div> */}

        {/* {showUpdates && <div className="absolute left-0 top-0 right-0 bottom-5 w-full m-1 bg-background/50 gap-5 font-bold pointer-events-none mx-auto">
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
                <div className="flex gap-2 items-center">
                    <div><PartyPopper /></div>
                    All new processes will be spawned with WASM64 support!
                </div>
            </div>

        </div>} */}

        <div className="flex flex-col gap-5 items-start my-auto md:ml-36">
            <h1 className="text-6xl font-bold" suppressHydrationWarning>BetterIDEa</h1>

            <p className="text-lg">
                <span className="text-primary font-medium">ao&apos;s</span> development environment. {
                    words[Math.floor(Math.random() * words.length)]
                }
            </p>

            {!wallet.isConnected && <Button onClick={() => document.getElementById("connect-btn")?.click()}>Connect Wallet</Button>}

            <div className="flex flex-col text-left my-6 gap-1">
                <Button variant="link" className="justify-start items-start h-7 text-foreground/90 gap-1 px-0" onClick={() => document.getElementById("new-project")?.click()}>
                    <PlusSquare size={20} /> New Project
                </Button>
                <Button variant="link" className="justify-start items-start h-7 text-foreground/90 gap-1 px-0" onClick={() => document.getElementById("all-projects")?.click()}>
                    <FileStack size={20} /> All Projects
                </Button>

                {/* <TooltipProvider delayDuration={0}>
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
                </TooltipProvider> */}

                <div className="w-full mt-5">
                    <div className="font-medium mt-5 my-3 text-muted-foreground text-xl">Recent Projects</div>
                    <div className="pl-2">
                        {
                            recents.toReversed().map((pname, i) => <Button key={i} variant="link" className="flex h-7 gap-2 px-1 justify-start text-foreground/90 tracking-wide"
                                onClick={() => openRecent(pname)}
                            >
                                <FileCodeIcon size={18} className="text-primary" />
                                <span className="">{pname}</span>
                            </Button>)
                        }
                        {recents.length === 0 && <div className="text-sm text-foreground/60">No recent projects</div>}
                    </div>
                </div>

            </div>

        </div>
        <div className="p-5 overflow-scroll my-auto flex flex-col justify-start items-start">

            <div className="min-h-[200px]">
                {profile.loading ? <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div> : <div className="flex gap-5 items-center justify-center">
                    {(profile.avatar && profile.avatar != "None") ? <Image src={`https://arweave.net/${profile.avatar}`} alt="profile-picture" className="rounded-full aspect-square" width={69} height={69} /> : <UserRound size={60} className="block bg-muted/20 rounded-full p-2" />}
                    <div>
                        <div className="text-2xl">gm<span className="font-bold text-3xl">{profile.displayName && " " + profile.displayName}</span><i>!</i></div>
                        <div className="mt-1">How are you doing today?</div>
                        {/* <Button variant="link" className="h-5 p-0 text-xs">{profile.displayName ? "Edit Profile" : "Create Profile"}</Button> */}
                    </div>
                </div>}
            </div>

            <div className="mb-auto">
                <div className="font-medium mb-5 text-muted-foreground text-xl">Fresh Articles</div>
                <div className="pl-2 flex flex-col gap-3 overflow-scroll">
                    {
                        published.map((post, i) =>
                            <Link href={post.link} target="_blank" key={i}><Button variant="link" className="flex gap-2 px-1 justify-start text-foreground/90 tracking-wide">
                                <div><NewspaperIcon size={18} className="text-primary" /></div>
                                <div className="flex flex-col items-start">
                                    <span className="font-medium">{post.title}</span>
                                    <span className="font-light text-sm">{post.desc}</span>
                                </div>
                            </Button></Link>)
                    }
                </div>
            </div>
        </div>
    </div>
}

const viewItem: TView = {
    component: Home,
    label: "Home",
    value: null
}

export default viewItem;
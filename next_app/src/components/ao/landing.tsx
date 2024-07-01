
import { toast } from "sonner"
import { Button } from "../ui/button"
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import Link from "next/link";
import { AlertTriangleIcon, FileCodeIcon, FolderOpen, InfoIcon, NewspaperIcon, PartyPopper, PlusSquare } from "lucide-react";
import {FaDiscord, FaTwitter, FaGithub} from "react-icons/fa"

const words = [
    // "winston",
    // "dumdum",
    // "pikachu",
    // "bulbasaur",
    // "charmander",
    // "squirtle",
    // "jigglypuff",
    // "buildooor",
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

// function ContentItem({ title, desc, link }) {
//     return <Link href={link} target="_blank" className="flex flex-col items-center gap-2 border p-2 px-4 rounded-md ring-foreground bg-foreground/0 hover:bg-primary/20 active:bg-primary/40 hover:scale-105 active:scale-100 transition-all duration-200">
//         <span className="font-bold">{title}</span>
//         <span className="text-sm text-center">{desc}</span>
//     </Link>
// }

export default function AOLanding() {
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", false, { initializeWithValue: true });
    const [recents, setRecents] = useLocalStorage("recents", [], { initializeWithValue: true });
    const [showUpdates, setShowUpdates] = useState(false);

    async function connectWallet() {
        if (!window.arweaveWallet)
            // return toast({
            //     title: "No Arweave wallet found",
            //     description: "You might want to install ArConnect extension to connect your wallet",
            // });
            return toast.error("No Arweave wallet found. Please install ArConnect extension to connect your wallet");
        await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
        const addr = await window.arweaveWallet.getActiveAddress();
        const addrCropped = addr.slice(0, 9) + "..." + addr.slice(-9);
        setWalletAddress(addr);
        // toast({ title: `Connected to ${addrCropped}` });
        toast.success(`Connected to ${addrCropped}`, { id: "connected" });
        setAutoconnect(true);
    }

    function disconnectWallet() {
        if (!window.arweaveWallet) return;
        window.arweaveWallet.disconnect();
        setAutoconnect(false);
        setWalletAddress("");
    }
    
    useEffect(() => {
        if (autoconnect) {
            setTimeout(() => {
                window.arweaveWallet.getActiveAddress().then((addr: string) => {
                    connectWallet()
                }).catch(() => {
                    setAutoconnect(false);
                });
            }, 150);
        }
        else {
            disconnectWallet();
        }
    }, [autoconnect]);

    return <>
        <section className="text-foreground/90 p-5 overflow-scroll grid grid-cols-1 md:grid-cols-2 md:gap-5 ring-foreground h-full w-full min-w-[100vw] md:pl-20">
            
            <div className="absolute bottom-0 z-[100] mx-auto w-fit ring-destructive-foreground bg-destructive text-destructive-foreground p-1 px-3 rounded-md left-0 right-0 flex gap-2 items-center cursor-pointer" onMouseOver={() => setShowUpdates(true)} onMouseLeave={() => setShowUpdates(false)}><InfoIcon size={17} />UPDATES</div>
            {showUpdates && <div className="absolute left-0 top-0 right-0 bottom-0 m-1 bg-background/20 gap-5 font-bold pointer-events-none w-1/2 mx-auto">
                <div className="absolute bottom-10 left-0 right-0 w-fit bg-destructive p-3 text-sm rounded-md mx-auto ring- ring-destructive-foreground flex flex-col items-start justify-center gap-2">
                
                <div className="flex gap-2 items-center text-destructive-foreground"><div>
                    <AlertTriangleIcon />
                </div> If you had notebook files which have become normal files now, please change their filename to .luanb extension</div>
                <div className="flex gap-2 items-center text-destructive-foreground"><div>
                    <AlertTriangleIcon />
                </div> Old processes must perform a security update (settings &gt; patch 6-5-24): only for processes spawned prior to AOS 1.11.0</div>
                <div className="flex gap-2 items-center"><div><PartyPopper/></div> All new processes will be spawned with WASM64 support!</div>
                </div>
            
            </div>}

            <div className="flex flex-col gap-5 items-start md:h-2/3 my-auto">
                <h1 className="text-6xl font-bold" suppressHydrationWarning>BetterIDEa</h1>

                <p className="text-lg">
                    <span className="text-primary font-medium">ao&apos;s</span> development environment. {
                        words[Math.floor(Math.random() * words.length)]
                    }
                </p>

                {!walletAddress && <Button onClick={()=>document.getElementById("connect-btn")?.click()}>Connect Wallet</Button>}

                <div className="flex flex-col text-left my-6 gap-1">
                    <Button variant="link" className="justify-start h-7 text-foreground/90 gap-1 px-0" onClick={() => document.getElementById("new-proj-dialog").click()}>
                        <PlusSquare size={20} /> New Project
                    </Button>
                    {/* <Button variant="link" className="justify-start h-7 ring-1 text-foreground/90 gap-1 px-0">
                        <FolderOpen size={20} /> Open Existing
                    </Button> */}
                </div>
                <div className=" flex gap-5">
                    <Link href="https://discord.gg/nm6VKUQBrA" target="_blank" className="hover:scale-150">
                        <FaDiscord size={25} />
                    </Link>
                    <Link href="https://x.com/betteridea_dev" target="_blank" className="hover:scale-150">
                        <FaTwitter size={25} />
                    </Link>
                    <Link href="https://github.com/betteridea-dev" target="_blank" className="hover:scale-150">
                        <FaGithub size={25} />
                    </Link>
                </div>
                {/* <div>Latest content</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <ContentItem title="Installing Packages" desc="Learn how to use APM and install packages on processes" link="https://mirror.xyz/0xCf673b87aFBed6091617331cC895376209d3b923/M4XoQFFCAKBH54bwIsCFT3Frxd575-plCg2o4H1Tujs" />
                    <ContentItem title="Portable Codecells" desc="Learn how to integrate our codecells into your webapps" link="https://youtu.be/e7Gx2NdWXLQ?si=hg8Ih7828AsVjpp7" />
                    <ContentItem title="Unit Testing" desc="Try writing unit tests for your AO functions" link="https://mirror.xyz/0xCf673b87aFBed6091617331cC895376209d3b923/uBgGB-HNhlig7RucAzdSyRjJIJSXCug5NMgN7bXS9qk" />
                    <ContentItem title="BetterIDEa graphs" desc="Fetch and plot live crypto prices data using 0rbit oracle and BetterIDEa graphs" link="https://ide.betteridea.dev/import?id=2voE0ERMT6CCPRVEkTsotDR-dmHgfoSH6dvucL9rSQc"/>
                </div> */}
            </div>
            <div className="p-5 flex flex-col gap-4 md:gap-10 overflow-scroll h-fit my-auto">
                <details open>
                    <summary className="font-medium mb-2">Recent Projects</summary>
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
                </details>
                <details open>
                    <summary className="font-medium mb-2">Freshly Published</summary>
                    <div className="pl-5 flex flex-col gap-3 overflow-scroll">
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
        </section>
    </>
}

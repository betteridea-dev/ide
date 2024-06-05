import { toast } from "@/components/ui/use-toast";
import { Button } from "../ui/button"
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import Link from "next/link";

const words = [
    "winston",
    "dumdum",
    "pikachu",
    "bulbasaur",
    "charmander",
    "squirtle",
    "jigglypuff",
    "buildooor",
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

function ContentItem({ title, desc, link }) {
    return <Link href={link} target="_blank" className="flex flex-col items-center gap-2 ring-1 p-2 px-4 rounded-md ring-foreground bg-foreground/0 hover:bg-primary/20 active:bg-primary/40 hover:scale-105 active:scale-100 transition-all duration-200">
        <span className="font-bold">{title} 🔗</span>
        <span className="text-sm">{desc}</span>
    </Link>
}

export default function AOLanding() {
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", false, { initializeWithValue: true });

    async function connectWallet() {
        if (!window.arweaveWallet)
            return toast({
                title: "No Arweave wallet found",
                description: "You might want to install ArConnect extension to connect your wallet",
            });
        await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
        const addr = await window.arweaveWallet.getActiveAddress();
        const addrCropped = addr.slice(0, 9) + "..." + addr.slice(-9);
        setWalletAddress(addr);
        toast({ title: `Connected to ${addrCropped}` });
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
            window.arweaveWallet.getActiveAddress().then((addr: string) => {
                connectWallet()
            }).catch(() => {
                setAutoconnect(false);
            });
        }
        else {
            disconnectWallet();
        }
    }, [autoconnect]);

    return <>
        <section className="container text-foreground/90 p-24 my-16">
            <div className="flex flex-col gap-5 items-center">

                <h1 className="text-6xl font-bold" suppressHydrationWarning>gm {
                    words[Math.floor(Math.random() * words.length)]
                }</h1>

                <p className="text-lg">
                    Welcome to the intuitive web IDE for building powerful <span className="text-primary">actor oriented</span> applications.
                </p>

                {!walletAddress && <Button onClick={connectWallet}>Connect Wallet</Button>}

                <div className="flex flex-col text-center gap-x-4 my-6">
                    <h1 className="px-8">Create a new project from the sidebar</h1>
                    <h1 className="px-8">
                        Or open an existing one ;)
                    </h1>
                </div>
                <div>Latest content</div>
                <div className="grid grid-cols-3 gap-3">
                    <ContentItem title="Portable Codecells" desc="Learn how to integrate our codecells into your webapps" link="https://youtu.be/e7Gx2NdWXLQ?si=hg8Ih7828AsVjpp7" />
                    <ContentItem title="Unit Testing" desc="Try writing unit tests for your AO functions" link="https://mirror.xyz/0xCf673b87aFBed6091617331cC895376209d3b923/uBgGB-HNhlig7RucAzdSyRjJIJSXCug5NMgN7bXS9qk" />
                    <ContentItem title="BetterIDEa graphs" desc="Fetch and plot live crypto prices data using 0rbit oracle and BetterIDEa graphs" link="https://ide.betteridea.dev/import?id=2voE0ERMT6CCPRVEkTsotDR-dmHgfoSH6dvucL9rSQc"/>
                </div>
            </div>
        </section>
    </>
}
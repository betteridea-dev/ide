import { toast } from "@/components/ui/use-toast";
import { Button } from "../ui/button"
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

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

const cat = `
ᓚᘏᗢ
`

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

                <div className="flex flex-col text-center gap-x-4 mt-8">
                    <h1 className="px-8">Create a new project from the sidebar</h1>
                    <h1 className="px-8">
                        Or open an existing one ;)
                    </h1>
                </div>
            </div>
        </section>
    </>
}
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useLocalStorage } from "usehooks-ts";
import Icons from "@/assets/icons";
import Image from "next/image";
import { useProjectManager } from "@/hooks";
import { useGlobalState } from "@/states";

export default function BottomStatusbar() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", false, { initializeWithValue: true });
  const [mounted, setMounted] = useState(false);
  const manager = useProjectManager();
  const globalState = useGlobalState();

  const project = globalState.activeProject && manager.getProject(globalState.activeProject);

  async function connectWallet() {
    if (!window.arweaveWallet)
      return toast({
        title: "No Arweave wallet found",
        description: "You might want to install ArConnect extension to connect your wallet",
      });
    await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
    const addr = await window.arweaveWallet.getActiveAddress();
    setWalletAddress(addr);
    const addrCropped = addr.slice(0, 9) + "..." + addr.slice(-9);
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
      if (!mounted)
        window.arweaveWallet.getActiveAddress().then((addr: string) => {
          connectWallet()
          setMounted(true);
        }).catch(() => {
          setAutoconnect(false);
        });
    }
    else {
      disconnectWallet();
    }
  }, [autoconnect, mounted]);

  return (
    <div className="h-[25px] flex items-center overflow-clip gap-0.5 px-0 text-xs border-t">
      <Button variant="ghost" data-connected={walletAddress.length > 0} className="p-1 rounded-none data-[connected=false]:text-white data-[connected=false]:bg-primary text-xs" onClick={connectWallet}>
        {walletAddress ? `Connected: ${walletAddress}` : "Connect"}
      </Button>
      {walletAddress.length > 0 && (
        <Button variant="ghost" className="p-1 rounded-none text-xs " onClick={disconnectWallet}>
          <Image src={Icons.disconnectSVG} alt="disconnect" width={20} height={20} className="invert dark:invert-0" />
        </Button>
      )}
      <div className="grow"></div>
      {project.process && (
        <Button
          variant="ghost"
          className="p-1 text-xs"
          onClick={() => {
            navigator.clipboard.writeText(project.process);
            toast({ title: "Copied to clipboard" });
          }}
        >
          AO Process: {project.process}
        </Button>
      )}
    </div>
  );
}

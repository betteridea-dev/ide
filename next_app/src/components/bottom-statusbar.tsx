import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function BottomStatusbar() {
  const [mounted, setMounted] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

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
  }

  return (
    <div className="h-[25px] bg-btr-grey-2/70 flex items-center">
      <Button variant="ghost" data-connected={walletAddress.length > 0} className="h-[25px] rounded-none text-xs data-[connected=false]:text-black data-[connected=false]:bg-btr-green" onClick={connectWallet}>
        {walletAddress ? `Connected: ${walletAddress}` : "🚨 Connect"}
      </Button>
    </div>
  );
}

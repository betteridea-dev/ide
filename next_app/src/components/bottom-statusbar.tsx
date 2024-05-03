import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useLocalStorage } from "usehooks-ts";
import Icons from "@/assets/icons";
import Image from "next/image";

export default function BottomStatusbar() {
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
    window.arweaveWallet.disconnect();
    setAutoconnect(false);
    setWalletAddress("");
  }

  useEffect(() => {
    if (autoconnect) connectWallet();
  }, [autoconnect]);

  return (
    <div className="h-[25px] bg-btr-grey-2/70 flex items-center overflow-clip gap-0.5 pl-1">
      <Button variant="ghost" data-connected={walletAddress.length > 0} className="p-1 rounded-none text-xs data-[connected=false]:text-black data-[connected=false]:bg-btr-green" onClick={connectWallet}>
        {walletAddress ? `Connected: ${walletAddress}` : "Connect"}
      </Button>
      {walletAddress.length > 0 && (
        <Button variant="ghost" className="p-1 rounded-none text-xs " onClick={disconnectWallet}>
          <Image src={Icons.disconnectSVG} alt="disconnect" width={20} height={20} />
        </Button>
      )}
    </div>
  );
}

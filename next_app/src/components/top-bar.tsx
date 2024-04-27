import Image from "next/image";
import { Button } from "@/components/ui/button";
import Icons from "@/assets/icons";
import { SwitchCustom } from "@/components/ui/custom/switch";
import { useRouter } from "next/navigation";
import { useGlobalState } from "@/states";

export default function TopBar() {
  const router = useRouter();
  const globalState = useGlobalState();

  return (
    <nav className="py-5 px-6 flex border-b justify-between items-center h-16">
      <div className="flex gap-0.5 items-center">
        <Image src="/icon.svg" alt="BetterIDEa" width={15} height={15} className="mr-5" />

        <Button variant="link" className="text-btr-grey-1 text-md hover:text-white">
          Home
        </Button>
        <Button variant="link" className="text-btr-grey-1 text-md hover:text-white">
          Docs
        </Button>
        <Button variant="link" className="text-btr-grey-1 text-md hover:text-white">
          Learn
        </Button>
      </div>

      <div className="flex gap-1 items-center">
        <Button variant="link" className="p-2 h-7 hover:invert">
          <Image src={Icons.mailSVG} alt="Inbox" width={15} height={15} />
        </Button>

        <Button variant="link" className="p-2 h-7 hover:invert">
          <Image src={Icons.downloadSVG} alt="Download" width={15} height={15} />
        </Button>

        <Button variant="link" className="p-2 h-7 hover:invert">
          <Image src={Icons.sendSVG} alt="Send" width={15} height={15} />
        </Button>

        <SwitchCustom
          className="ml-5"
          onCheckedChange={(checked) => {
            globalState.activeMode == "AO" ? globalState.setActiveMode("WARP") : globalState.setActiveMode("AO");
            checked ? router.replace(`/warp`) : router.replace(`/ao`);
          }}
          checked={globalState.activeMode == "WARP"}
        />
      </div>
    </nav>
  );
}

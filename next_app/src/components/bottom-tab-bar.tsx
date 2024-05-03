import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Image from "next/image";
import Icons from "@/assets/icons";
import { useGlobalState } from "@/states";

export default function BottomTabBar({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
  const globalState = useGlobalState();

  return (
    <Tabs defaultValue={globalState.activeMode == "AO" ? "terminal" : "output"} className="w-full h-full">
      <TabsList className="flex justify-start bg-transparent">
        {globalState.activeMode == "AO" && (
          <TabsTrigger value="terminal" className="rounded-none border-b data-[state=active]:border-btr-green">
            Terminal
          </TabsTrigger>
        )}
        {globalState.activeMode == "WARP" && (
          <TabsTrigger value="output" className="rounded-none border-b data-[state=active]:border-btr-green">
            Output
          </TabsTrigger>
        )}
        {globalState.activeMode == "AO" && (
          <TabsTrigger value="inbox" className="rounded-none border-b data-[state=active]:border-btr-green">
            Inbox
          </TabsTrigger>
        )}

        <Button variant="link" className="ml-auto p-2 pt-1 h-6" onClick={toggle}>
          <Image src={Icons.collapseSVG} alt="collapse-expand" width={20} height={20} data-collapsed={collapsed} className="data-[collapsed=false]:rotate-180 opacity-80" />
        </Button>
      </TabsList>

      <div className="px-3">
        <TabsContent value="terminal">Term</TabsContent>
        <TabsContent value="output">Lua output</TabsContent>
        <TabsContent value="inbox">Inbox</TabsContent>
      </div>
    </Tabs>
  );
}

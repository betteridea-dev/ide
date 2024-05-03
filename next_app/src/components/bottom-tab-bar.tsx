import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";

export default function BottomTabBar({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
  return (
    <Tabs defaultValue="output" className="w-full h-full">
      <TabsList className="flex justify-start bg-transparent">
        <TabsTrigger value="terminal" className="rounded-none border-b data-[state=active]:border-btr-green">
          Terminal
        </TabsTrigger>
        <TabsTrigger value="output" className="rounded-none border-b data-[state=active]:border-btr-green">
          Output
        </TabsTrigger>
        <TabsTrigger value="inbox" className="rounded-none border-b data-[state=active]:border-btr-green">
          Inbox
        </TabsTrigger>

        <Button variant="ghost" className="ml-auto p-1 h-5" onClick={toggle}>
          {collapsed ? "expand" : "collapse"}
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

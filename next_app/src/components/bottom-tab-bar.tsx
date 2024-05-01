import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function BottomTabBar() {
  return (
    <Tabs defaultValue="output" className="w-full h-full">
      <TabsList className="flex justify-start bg-transparent">
        <TabsTrigger value="output" className="rounded-none border-b data-[state=active]:border-btr-green">
          Output
        </TabsTrigger>
        <TabsTrigger value="inbox" className="rounded-none border-b data-[state=active]:border-btr-green">
          Inbox
        </TabsTrigger>
      </TabsList>

      <div className="px-3">
        <TabsContent value="output">Lua output</TabsContent>
        <TabsContent value="inbox">Inbox</TabsContent>
      </div>
    </Tabs>
  );
}

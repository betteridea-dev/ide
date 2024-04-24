import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function BottomBar() {
  return (
    <Tabs defaultValue="output" className="w-full h-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="output">Output</TabsTrigger>
        <TabsTrigger value="inbox">Inbox</TabsTrigger>
      </TabsList>

      <TabsContent value="output">Account content</TabsContent>
      <TabsContent value="inbox">Password content</TabsContent>
    </Tabs>
  );
}

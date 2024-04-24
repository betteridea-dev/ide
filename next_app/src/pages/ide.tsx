import Image from "next/image";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SwitchCustom } from "@/components/ui/custom/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as Icons from "@/assets/icons";

const TopBar = () => {
  return (
    <nav className="p-4 px-6 flex border-b justify-between items-center h-16">
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
        <SwitchCustom className="ml-5" />
      </div>
    </nav>
  );
};

const FileBar = () => {
  return (
    <div className="flex gap-0.5 items-start overflow-scroll">
      <Button variant="ghost" data-active className="p-2 w-fit rounded-none border-b border-white bg-black/20 data-[active]:text-btr-green data-[active]:border-btr-green">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white bg-black/20">
        chatroom.lua
      </Button>
    </div>
  );
};

export default function IDE() {
  return (
    <>
      <Head>
        <title>BetterIDEa</title>
      </Head>
      <TopBar />
      <main className="h-[calc(100vh-64px)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={5} maxSize={20} id="file-panel" onResize={console.log} className="p-1 flex flex-col">
            <Button variant="ghost" className="w-fit hover:bg-btr-grey-3">
              <Image src={Icons.newProjectSVG} alt="New Project" width={25} height={25} className="mr-2" />
              <div>New Project</div>
            </Button>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70} minSize={15} id="editor-panel" onResize={console.log}>
                <FileBar />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={15} id="terminal-panel" onResize={console.log} className="p-2"></ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  );
}

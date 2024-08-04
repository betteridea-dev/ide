import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TView } from ".."
import { useGlobalState, useProjectManager, useWallet } from "@/hooks";
import { Button } from "@/components/ui/button";
import SingleFileEditor from "./components/single-file-editor";
import NotebookEditor from "./components/notebook-editor";
import { LoaderIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import runIcon from "@/assets/icons/run.svg";
import { toast } from "sonner";
import { runLua } from "@/lib/ao-vars";
import { sendGAEvent } from "@next/third-parties/google";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AOTerminal from "./components/terminal";
import Inbox from "./components/inbox";
import Output from "./components/output";
import PackageView from "./components/package";
import TableView from "./components/table";
import Interact from "./components/interact";

function Editor() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const wallet = useWallet();
    const [running, setRunning] = useState(false);
    // const [prompt, setPrompt] = useState("");
    const [commandOutputs, setCommandOutputs] = useState([]);

    const project = globalState.activeProject && manager.projects[globalState.activeProject];
    const files = project && Object.keys(project.files);

    function FileTabItem({ fname }: { fname: string }) {
        const [hovered, setHovered] = useState(false);
        const active = globalState.activeFile == fname;
        return <Button variant="ghost" onMouseEnter={() => setHovered(!active && true)} onMouseLeave={() => setHovered(!active && false)}
            className="rounded-none h-[39px] data-[active=true]:bg-primary border-r data-[active=true]:text-white px-1 pl-2.5"
            data-active={active}
            onClick={() => globalState.setActiveFile(fname)}>
            {fname} <X data-active={!active && hovered}
                className="data-[active=true]:text-primary text-background hover:bg-background/20 p-0.5 rounded-sm ml-1" size={18}
                onClick={(e) => {
                    e.stopPropagation()
                    globalState.closeOpenedFile(fname)
                }}
            />
        </Button>

    }

    function switchFileType(): JSX.Element {
        if (!globalState.activeFile) {
            globalState.setActiveView(null)
            return
        }
        const activeFile = globalState.activeFile;
        switch (activeFile.split(".").pop()) {
            case "luanb":
                return <NotebookEditor />
            default:
                const type = activeFile.split(":")[0];
                switch (type) {
                    case "PKG":
                        return <PackageView />
                    case "TBL":
                        return <TableView />
                    default:
                        return <SingleFileEditor />
                }
        }
    }

    async function runLuaFile() {
        const p = manager.getProject(project.name);
        if (!p.process) return toast("No process found for this project");
        const ownerAddress = p.ownerWallet;
        const activeAddress = wallet.address;
        // if (ownerAddress != activeAddress) return toast({ title: "The owner wallet for this project is differnet", description: `It was created with ${shortAddress}.\nSome things might be broken` })
        if (ownerAddress != activeAddress) return toast.error(`The owner wallet for this project is differnet\nIt was created with ${wallet.shortAddress}.\nSome things might be broken`)

        const file = project.files[globalState.activeFile];
        if (!file) return;
        const code = file.content.cells[0].code;
        console.log(code)

        setRunning(true);
        const fileContent = { ...file.content };
        const result = await runLua(fileContent.cells[0].code, file.process || p.process, [
            { name: "File-Type", value: "Normal" }
        ]);
        console.log(result);
        if (result.Error) {
            console.log(result.Error);
            globalState.setLastOutput("\x1b[1;31m" + result.Error as string);
            fileContent.cells[0].output = result.Error;
            toast.error(result.Error);
        } else {
            const outputData = result.Output.data;
            globalState.setPrompt(result.Output.prompt || result.Output.data.prompt)
            if (typeof outputData == "string" || typeof outputData == "number") {
                console.log(outputData);
                fileContent.cells[0].output = outputData;
                globalState.setLastOutput(outputData as string);
            }
            else if (outputData.output) {
                console.log(outputData.output);
                fileContent.cells[0].output = outputData.output;
                globalState.setLastOutput(outputData.output);
            } else if (outputData.json) {
                console.log(outputData.json);
                fileContent.cells[0].output = JSON.stringify(outputData.json, null, 2);
                globalState.setLastOutput(JSON.stringify(outputData.json, null, 2));
            }
        }
        manager.updateFile(p, { file, content: fileContent });
        setRunning(false);
        sendGAEvent({ event: 'run_code', value: 'file' })
    }

    useEffect(() => {
        setCommandOutputs([]);
        globalState.setSetTerminalOutputsFunction(setCommandOutputs);
    }, [])

    return <ResizablePanelGroup direction="vertical">
        <ResizablePanel collapsible defaultSize={50} minSize={10} className="">
            {/* FILE BAR */}
            <div className="h-[40px] flex overflow-scroll border-b relative">
                <div className="h-[40px] flex overflow-scroll relative">
                    {
                        globalState.openedFiles.map((file, i) => <FileTabItem key={i} fname={file} />)
                    }
                </div>
                {
                    globalState.activeFile && globalState.activeFile.endsWith(".lua") && <div className="bg-background static right-0 top-0 h-[39px] border-l flex items-center justify-center ml-auto">
                        <Button variant="ghost" id="run-code-btn" className="rounded-none h-[39px] w-[39px] p-0 bg-primary/20" onClick={runLuaFile}>
                            {running ?
                                <LoaderIcon size={20} className="p-0 animate-spin text-primary" />
                                : <Image src={runIcon} alt="Run" width={20} height={20} className="p-0" />}
                        </Button>
                    </div>
                }
            </div>
            <div className="h-[calc(100%-40px)] overflow-scroll">
                {/* FILE CONTENTS */}
                {switchFileType()}
            </div>
        </ResizablePanel>
        <ResizableHandle />
        {globalState.activeProject && <ResizablePanel defaultSize={20} minSize={5} collapsible onResize={() => {
            const termContainer = document.getElementById("terminal-container");
            if (termContainer) {
                termContainer.scrollTop = termContainer.scrollHeight;
            }
        }}>
            {/* BOTTOM BAR */}
            <div className="h-full">
                <Tabs className="h-full relative" defaultValue="output">
                    <TabsList className="h-[29px] border-b rounded-none w-full justify-start overflow-clip bg-transparent px-0">
                        <TabsTrigger value="terminal" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Terminal</TabsTrigger>
                        <TabsTrigger value="inbox" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Inbox</TabsTrigger>
                        <TabsTrigger value="output" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Output</TabsTrigger>
                        <TabsTrigger value="history" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">History</TabsTrigger>
                        {/* <TabsTrigger value="interact" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-white">Interact</TabsTrigger> */}
                    </TabsList>
                    <TabsContent id="terminal-container" value="terminal" className="h-[calc(100%-30px)] overflow-scroll m-0">
                        <AOTerminal commandOutputs={commandOutputs} setCommandOutputs={setCommandOutputs} />
                    </TabsContent>
                    <TabsContent value="inbox" className="h-[calc(100%-30px)] overflow-scroll m-0">
                        <Inbox />
                    </TabsContent>
                    <TabsContent value="output" className="h-[calc(100%-30px)] overflow-scroll m-0">
                        <Output />
                    </TabsContent>
                    <TabsContent value="history" className="h-[calc(100%-30px)] overflow-scroll m-0">
                        Command History
                    </TabsContent>
                    {/* <TabsContent value="interact" className="h-[calc(100%-30px)] overflow-scroll m-0">
                        <Interact />
                    </TabsContent> */}
                </Tabs>
            </div>
            {/* <div className="h-[calc(100%-30px)] overflow-scroll ring-1">

            </div> */}
        </ResizablePanel>}
    </ResizablePanelGroup>
}

const viewItem: TView = {
    component: Editor,
    label: "Editor",
    value: "EDITOR"
}

export default viewItem;
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Image from "next/image";
import Icons from "@/assets/icons";
import { useGlobalState } from "@/states";
import { useProjectManager } from "@/hooks";
import Ansi from "ansi-to-react";
import { stripAnsiCodes, tsToDate } from "@/lib/utils";
import { getResults, runLua } from "@/lib/ao-vars";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { sendGAEvent } from "@next/third-parties/google";
import { ScrollArea } from "@/components/ui/scroll-area"
import { dryrun } from "@permaweb/aoconnect";
import Term from "./terminal";
import { ArrowBigUp, Expand, Fullscreen, PanelBottomCloseIcon, PanelBottomOpenIcon } from "lucide-react";


interface TInboxMessage {
  Data: string;
  "Block-Height": number;
  From: string;
  Id: string;
  Nonce: number;
  Owner: string;
  Target: string;
  Timestamp: number;
  Action: string;
}

export default function BottomTabBar({ collapsed, toggle, setFullScreen, fullscreen }: { collapsed: boolean; toggle: () => void; setFullScreen: () => void; fullscreen: boolean }) {
  const [commandOutputs, setCommandOutputs] = useState([]);
  const [running, setRunning] = useState(false);
  const [prompt, setPrompt] = useState("aos>");
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [inbox, setInbox] = useState<TInboxMessage[]>([]);
  const terminalInputRef = useRef<HTMLInputElement>();
  const manager = useProjectManager();
  const globalState = useGlobalState();

  const project = globalState.activeProject && manager.getProject(globalState.activeProject);
  const file = project && globalState.activeFile && project.getFile(globalState.activeFile);

  useEffect(() => {
    if (globalState.activeMode == "AO") {
      setCommandOutputs([]);
    }
  }, [globalState.activeProject]);

  useEffect(() => {
    async function fetchNewInbox() {
      if (globalState.activeMode == "WARP") return;
      if (!project || !project.process) return;
      const ownerWallet = project.ownerWallet;
      const activeWallet = await window.arweaveWallet.getActiveAddress();
      if (ownerWallet != activeWallet) return;
      // console.log("ran");
      const cursor = sessionStorage.getItem("cursor") || "";
      const r = await getResults(project.process, cursor);
      if (r.cursor) sessionStorage.setItem("cursor", r.cursor);
      let fetchFlag = false;
      if (r.results.length > 0) {
        const messages = r.results;
        messages.forEach((msg: any) => {
          const isPrint = msg.Output.print;
          if (isPrint) {
            const data = msg.Output.data;
            console.log(data);
            fetchFlag = true;
            // toast({ variant: "newMessage", title: stripAnsiCodes(data) });
            toast.custom((id) => <div className="bg-primary text-white p-2 px-4 border border-btr-black-1 rounded-md max-h-[400px]">{stripAnsiCodes(data)}</div>);
            setCommandOutputs(p => [...p, data]);

          }
        });
        console.log(r.results);
        // fetchFlag && getInbox();
      }
    }

    sessionStorage.setItem("interval", setInterval(fetchNewInbox, 3000).toString());

    return () => {
      clearInterval(parseInt(sessionStorage.getItem("interval") || "0"));
    };
  }, [globalState.activeMode, project, project.process]);



  async function getInbox() {
    if (!process) {
      // return toast({ title: "Select a project to view Inbox" });
      return toast.error("Select a project to view Inbox");
    }
    const pid = project.process;
    if (!pid) {
      // return toast({
      //   title: "No process for this project :(",
      //   description: "Please assign a process id from project settings before trying to run Lua code",
      // });
      return toast.error("No process for this project :(\nPlease assign a process id from project settings before trying to run Lua code");
    }
    setLoadingInbox(true);
    const result = await runLua("require('json').encode(Inbox)", pid, [
      { name: "File-Type", value: "Inbox" }
    ]);
    if (result.Output.data.output)
      setInbox(JSON.parse(result.Output.data.output).reverse());
    // const r = await dryrun({
    //   process: pid,
    //   code: "return require('json').encode(Inbox)",
    //   tags: [{ name: "Action", value: "Eval" }, { name: "File-Type", value: "Inbox" }],
    // })
    // console.log(r)
    setLoadingInbox(false);

  }

  function showFullMessage(_) { }

  return (
    <Tabs defaultValue="" onChange={(e) => console.log(e)} className=" pt-7 w-full h-full">
      {globalState.activeProject && <TabsList className="border-b rounded-none flex justify-start p-0 absolute top-0 h-7 bg-background z-30 w-full" onClick={() => { if (collapsed) toggle() }}>
        {globalState.activeMode == "AO" && (
          <TabsTrigger value="inbox" className="rounded-none border-b data-[state=active]:border-primary" onClick={getInbox}>
            Inbox {loadingInbox ? <Image src={Icons.loadingSVG} alt="loading" width={20} height={20} className="animate-spin ml-1" /> : `(${inbox.length})`}
          </TabsTrigger>
        )}
        {globalState.activeMode == "AO" && (
          <TabsTrigger value="terminal" className="rounded-none border-b data-[state=active]:border-primary">
            Terminal
          </TabsTrigger>
        )}
        {file && file.type == "NORMAL" && <TabsTrigger value="output" className="rounded-none border-b data-[state=active]:border-primary">
          Output
        </TabsTrigger>}
      </TabsList>}
      {!fullscreen && <Button variant="link" className="ml-auto absolute right-10 h-6 p-0 top-0.5 z-40" title="Maximise Panel" onClick={() => { setFullScreen() }}>
        {/* <Image src={Icons.collapseSVG} alt="collapse-expand" width={22} height={22} data-collapsed={collapsed} className=" opacity-80 invert dark:invert-0" /> */}
        <Expand className="stroke-foreground opacity-70" size={20} />
      </Button>}
      <Button variant="link" className="ml-auto absolute right-2.5 p-0 h-6 top-0.5 z-40" onClick={toggle} title="Toggle Panel">
        {/* <Image src={Icons.collapseSVG} alt="collapse-expand" width={22} height={22} data-collapsed={collapsed} className="data-[collapsed=false]:rotate-180 opacity-80 invert dark:invert-0" /> */}
        {collapsed ? <PanelBottomOpenIcon className="stroke-foreground opacity-60" size={23} /> : <PanelBottomCloseIcon className="stroke-foreground opacity-60" size={23} />}
      </Button>

      <div className={`px-2 h-full overflow-scroll`}>
        <TabsContent value="terminal" className=" -m-2 mt-0 h-full">
          {globalState.activeProject && <Term prompt={prompt} setPrompt={setPrompt} commandOutputs={commandOutputs} setCommandOutputs={setCommandOutputs} />}
          {/* <div className="flex items-center h-full">
            <div className="block">{prompt}</div>&nbsp;
            <input
              // contentEditable={!running}
              placeholder="Enter LUA command here..."
              ref={terminalInputRef}
              data-running={running}
              disabled={running}
              className="p-0.5 pr-0 grow block overflow-x-scroll border border-border/20 focus-visible:ring-transparent disabled:text-muted text-muted focus:text-primary outline-none "
              onKeyDown={async (e) => {
                // console.log(e);
                if (e.key === "Enter") {
                  e.preventDefault();
                  // const code = e.target.value
                  const code = terminalInputRef.current.value;
                  console.log(code);
                  if (!project)
                    return toast({
                      title: "Select a project to run code in",
                    });
                  if (!project.process) {
                    return toast({
                      title: "No process for this project :(",
                      description: "Please assign a process id from project settings before trying to run Lua code",
                    });
                  }
                  const ownerAddress = project.ownerWallet;
                  const activeAddress = await window.arweaveWallet.getActiveAddress();
                  const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
                  if (ownerAddress != activeAddress) return toast({ title: "The owner wallet for this project is differnet", description: `It was created with ${shortAddress}.\nSome things might be broken` })
                  if (code) {
                    console.log("running", code);
                    setRunning(true);
                    const result = await runLua(code, project.process, [
                      { name: "File-Type", value: "Terminal" }
                    ]);
                    if (result.Error) {
                      console.log(result.Error);
                      setCommandOutputs([result.Error, ...commandOutputs]);
                    }
                    if (result.Output) {
                      console.log(result.Output);
                      setPrompt(result.Output.data.prompt);
                      if (result.Output.data.json != "undefined") {
                        // console.log(result.Output.data.json);
                        setCommandOutputs([JSON.stringify(result.Output.data.json, null, 2), ...commandOutputs]);
                      } else {
                        // console.log(result.Output.data.output);
                        setCommandOutputs([result.Output.data.output, ...commandOutputs]);
                      }
                    }
                    terminalInputRef.current.value = "";
                    setRunning(false);
                    sendGAEvent({ event: 'run_code', value: 'terminal' })
                    setTimeout(() => {
                      terminalInputRef.current.focus();
                    }, 0);
                  }
                }
                // else {
                //   if (e.key != "Backspace" && e.key.length == 1) {
                //     e.preventDefault();
                //     // e.target.innerText += e.key;
                //     terminalInputRef.current.innerText += e.key;
                //   } else if (e.key === "Backspace") {
                //     e.preventDefault();
                //     // e.target.innerText = e.target.innerText.slice(0, -1);
                //     terminalInputRef.current.innerText = terminalInputRef.current.innerText.slice(0, -1);
                //   }
                // }
              }}
            />
          </div> */}
          {/* {running && (
            <div className="">
              &gt; <Image alt="loading" src={Icons.loadingSVG} width={20} height={20} className="animate-spin mx-1 inline-block" />
            </div>
          )}
          {
            <div className="overflow-scroll">
              {commandOutputs.map((output, index) => (
                <pre key={index}>
                  &gt; <Ansi>{`${output}`}</Ansi>
                </pre>
              ))}
            </div>
          } */}
        </TabsContent>
        <TabsContent value="output">
          <pre className="w-full overflow-scroll p-2 ">{globalState.activeMode == "AO" ? <>{<Ansi>{`${file && file.content.cells[0] && file.content.cells[0].output}`}</Ansi>}</> : <>...</>}</pre>
        </TabsContent>
        <TabsContent value="inbox" className="flex flex-col gap-2 pb-2">
          {inbox.map((msg, _) => (
            <div key={_} className="text-sm p-2 font-btr-code  border" onClick={() => showFullMessage(_)}>
              <span className="text-accent text-xs">{tsToDate(msg.Timestamp)} </span>
              <br />
              <span className="text-sm">{msg.From}</span> <span className="">{msg.Action && `(${msg.Action})`}</span>
              <br />
              <span className={msg.Data ? "text-primary" : "text-muted"}>{msg.Data ? <Ansi className="font-btr-code">{msg.Data}</Ansi> : "Message Without Data Field"}</span>
            </div>
          ))}
        </TabsContent>
      </div>
    </Tabs>
  );
}

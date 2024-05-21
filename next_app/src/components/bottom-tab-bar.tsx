import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import Image from "next/image";
import Icons from "@/assets/icons";
import { useGlobalState } from "@/states";
import { useProjectManager } from "@/hooks";
import Ansi from "ansi-to-react";
import { stripAnsiCodes, tsToDate } from "@/lib/utils";
import { getResults, runLua } from "@/lib/ao-vars";
import { toast } from "./ui/use-toast";
import { useState, useRef, useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import { sendGAEvent } from "@next/third-parties/google";
import { ScrollArea } from "@/components/ui/scroll-area"


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

export default function BottomTabBar({ collapsed, toggle }: { collapsed: boolean; toggle: () => void }) {
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
    async function fetchNewInbox() {
      if (globalState.activeMode == "WARP") return;
      if (!project || !project.process) return;
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
            sonnerToast.custom((id) => <div className="bg-primary text-black p-2 px-4 border border-btr-black-1 rounded-md">{stripAnsiCodes(data)}</div>);
            setCommandOutputs([data, ...commandOutputs]);
          }
        });
        console.log(r.results);
        // fetchFlag && getInbox();
      }
    }

    sessionStorage.setItem("interval", setInterval(fetchNewInbox, 2500).toString());

    return () => {
      clearInterval(parseInt(sessionStorage.getItem("interval") || "0"));
    };
  }, [globalState.activeMode, project, project.process]);

  async function getInbox() {
    if (!process) {
      return toast({ title: "Select a project to view Inbox" });
    }
    const pid = project.process;
    if (!pid) {
      return toast({
        title: "No process for this project :(",
        description: "Please assign a process id from project settings before trying to run Lua code",
      });
    }
    setLoadingInbox(true);
    const result = await runLua("require('json').encode(Inbox)", pid, [
      { name: "File-Type", value: "Inbox" }
    ]);
    setInbox(JSON.parse(result.Output.data.output).reverse());
    setLoadingInbox(false);
  }

  function showFullMessage(_) { }

  return (
    <Tabs defaultValue={globalState.activeMode == "AO" ? "terminal" : "output"} className="w-full">
      {globalState.activeProject && <TabsList className="flex justify-start p-0 bg-transparent">
        {globalState.activeMode == "AO" && (
          <TabsTrigger value="terminal" className="rounded-none border-b data-[state=active]:border-primary">
            Terminal
          </TabsTrigger>
        )}
        {file && file.type == "NORMAL" && <TabsTrigger value="output" className="rounded-none border-b data-[state=active]:border-primary">
          Output
        </TabsTrigger>}
        {globalState.activeMode == "AO" && (
          <TabsTrigger value="inbox" className="rounded-none border-b data-[state=active]:border-primary" onClick={getInbox}>
            Inbox {loadingInbox ? <Image src={Icons.loadingSVG} alt="loading" width={20} height={20} className="animate-spin ml-1 bg-black rounded-full" /> : `(${inbox.length})`}
          </TabsTrigger>
        )}

      </TabsList>}
      <Button variant="link" className="ml-auto absolute -right-1 -top-1" onClick={toggle}>
        <Image src={Icons.collapseSVG} alt="collapse-expand" width={20} height={20} data-collapsed={collapsed} className="data-[collapsed=false]:rotate-180 opacity-80 invert dark:invert-0" />
      </Button>

      {globalState.activeProject && <div className="px-2">
        <TabsContent value="terminal" className="font-btr-code">
          <div className="flex items-center">
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
          </div>
          {running && (
            <div className="">
              &gt; <Image alt="loading" src={Icons.loadingSVG} width={20} height={20} className="animate-spin mx-1 inline-block bg-black rounded-full" />
            </div>
          )}
          {
            <div className="overflow-scroll h-[64vh]">
              {commandOutputs.map((output, index) => (
                <pre key={index}>
                  &gt; <Ansi>{`${output}`}</Ansi>
                </pre>
              ))}
            </div>
          }
        </TabsContent>
        <TabsContent value="output">
          <pre className="w-full max-h-[69vh] overflow-scroll p-2 ">{globalState.activeMode == "AO" ? <>{<Ansi>{`${file && file.content.cells[0] && file.content.cells[0].output}`}</Ansi>}</> : <>...</>}</pre>
        </TabsContent>
        <TabsContent value="inbox" className="h-[35vh]">
          <ScrollArea className="h-[35vh]">
            {inbox.map((msg, _) => (
              <div key={_} className="text-sm p-2 my-2 font-btr-code  border" onClick={() => showFullMessage(_)}>
                <span className="text-accent text-xs">{tsToDate(msg.Timestamp)} </span>
                <br />
                <span className="text-sm">{msg.From}</span> <span className="">{msg.Action && `(${msg.Action})`}</span>
                <br />
                <span className={msg.Data ? "text-primary" : "text-muted"}>{msg.Data ? <Ansi className="font-btr-code">{msg.Data}</Ansi> : "Message Without Data Field"}</span>
              </div>
            ))}
          </ScrollArea>
        </TabsContent>
      </div>}
    </Tabs>
  );
}

import { Editor, useMonaco } from "@monaco-editor/react";
import theme from "../../../themes/notebook.json";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import {
  connect,
  createDataItemSigner,
  result as aoResult,
  results,
} from "@permaweb/aoconnect";
import { Icons } from "@/components/icons";
import Ansi from "ansi-to-react";
import { AOModule, AOScheduler, _0RBT } from "../../../config";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { postToOrbit, tsToDate } from "@/lib/utils";

// TODO: Replace with shadcn code
import { toast } from "react-hot-toast";

interface TCellCodeState {
  [key: string]: string;
}

interface TCellOutputState {
  [key: string]: string;
}

interface TInboxMessage {
  Data: string;
  "Block-Height": number;
  From: string;
  Id: string;
  Nonce: number;
  Owner: string;
  Target: string;
  Timestamp: number;
}

function sendMessage({ data, processId }: { data: string; processId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signer = createDataItemSigner((window as any).arweaveWallet);
  return connect().message({
    process: processId,
    signer,
    tags: [{ name: "Action", value: "Eval" }],
    data,
  });
}

async function executeCode({
  cellId,
  aosProcess,
  cellCodeItems,
  // cellOutputItems,
  setCellOutputItems,
  setCodeStatus,
}: {
  cellId: string;
  aosProcess: string;
  cellCodeItems: TCellCodeState;
  // cellOutputItems: TCellOutputState;
  setCellOutputItems: React.Dispatch<React.SetStateAction<TCellOutputState>>;
  setCodeStatus: React.Dispatch<
    React.SetStateAction<"success" | "error" | "running" | "default">
  >;
}) {
  setCodeStatus("running");

  // const codeToRun = editorRef.current.getValue();
  const codeToRun = cellCodeItems[cellId];
  console.log("sending message", codeToRun);

  try {
    const r = await sendMessage({ data: codeToRun, processId: aosProcess });

    // REMOVE THE ANY LATER WHEN TYPES ARE FIXED ON AO-CONNECT
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await aoResult({
      message: r,
      process: aosProcess,
    });

    if (
      res.Messages.length > 0 &&
      res.Messages[0].Target &&
      res.Messages[0].Target == _0RBT
    ) {
      postToOrbit(true);
      console.log("0rbit detected");
    } else {
      postToOrbit(false);
      console.log("no 0rbit");
    }

    const formattedOutput = `${
      JSON.stringify(res.Output.data.output, null, 2) || res.Output.data.output
    }`;

    setCellOutputItems((prev) => ({ ...prev, [cellId]: formattedOutput }));
    setCodeStatus("success");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(e);
    setCellOutputItems((prev) => ({
      ...prev,
      [cellId]: e.message ?? "Error executing this snippet",
    }));

    setCodeStatus("error");
  }
}

function CodeCell({
  cellId,
  aosProcess,
  cellCodeItems,
  cellOutputItems,
  setCellCodeItems,
  setCellOutputItems,
  activeCellId,
  deleteCell,
  setActiveCell,
}: {
  cellId: string;
  aosProcess: string;
  cellCodeItems: TCellCodeState;
  setCellCodeItems: React.Dispatch<React.SetStateAction<TCellCodeState>>;
  cellOutputItems: TCellOutputState;
  setCellOutputItems: React.Dispatch<React.SetStateAction<TCellOutputState>>;
  activeCellId?: string;
  deleteCell: (val: string) => void;
  setActiveCell: (val: string) => void;
}) {
  const [codeStatus, setCodeStatus] = useState<
    "success" | "error" | "running" | "default"
  >("default");

  const monaco = useMonaco();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco?.editor.defineTheme("merbivore", theme as any);
  monaco?.editor.addEditorAction({
    id: "run",
    label: "Run",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    contextMenuGroupId: "navigation",
    contextMenuOrder: 1.5,
    run: async () => {
      console.log("running from keybinding", activeCellId);

      executeCode({
        cellId: activeCellId!,
        aosProcess,
        cellCodeItems,
        setCellOutputItems,
        setCodeStatus,
      });
    },
  });

  return (
    <div className="flex w-full md:max-w-[calc(90vw-12rem)] flex-col justify-center overflow-x-clip rounded-lg border border-[#323232]">
      <div className="flex flex-row gap-4 bg-black/70 border-b border-[#323232] px-4 py-6 rounded-t-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            executeCode({
              cellId,
              aosProcess,
              cellCodeItems,
              // cellOutputItems,
              setCellOutputItems,
              setCodeStatus,
            })
          }
        >
          <Icons.executeCode className="h-6 w-6" />
        </Button>

        <div className="min-h-[52px] flex-grow overflow-clip rounded-sm">
          <Editor
            className="max-h-[380px] min-h-[52px]"
            language="lua"
            theme="merbivore"
            height={
              (cellCodeItems[cellId].split("\n").length > 20
                ? 20
                : cellCodeItems[cellId].split("\n").length) * 19
            }
            defaultValue={cellCodeItems[cellId]}
            onChange={(value) => {
              setCellCodeItems((prev) => ({
                ...prev,
                [cellId]: value!,
              }));
              setActiveCell(cellId);
            }}
            options={{
              minimap: { enabled: false },
              // lineNumbers: "off",
              lineNumbersMinChars: 2,
              scrollBeyondLastLine: false,
              renderLineHighlight: "none",
            }}
          />
        </div>

        <Button variant="ghost" size="icon" onClick={() => deleteCell(cellId)}>
          <Icons.delete className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex min-h-[32px] flex-row gap-4 bg-[#050505]/40 px-4 py-3 rounded-b-lg">
        <div className="flex min-h-[32px] min-w-[30px] items-center justify-center">
          {codeStatus == "running" && (
            <Icons.codeRunning className="h-4 w-4  animate-spin" />
          )}
          {codeStatus == "success" && <Icons.codeSuccess className="h-4 w-4" />}
          {codeStatus == "error" && <Icons.codeError className="h-4 w-4" />}
        </div>

        <pre className="mx-2 max-h-[300px] min-h-[32px] flex-grow overflow-scroll p-2 ring-white/5">
          {(() => {
            try {
              return <Ansi>{`${JSON.parse(cellOutputItems[cellId])}`}</Ansi>;
            } catch (e) {
              // console.log(e.message);
              return `${cellOutputItems[cellId]}`;
            }
          })()}
        </pre>

        <div className="min-w-[30px]"></div>
      </div>
    </div>
  );
}

export default function AONotebook() {
  const [isSpawning, setSpawning] = useState<boolean>(false);
  const [aosProcessId, setAOSProcess] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [cellIds, setCellOrder] = useState<string[]>(["0"]);
  const [cellCodeItems, setCellCodeItems] = useState<TCellCodeState>({
    "0": "1 + 41",
  });
  const [cellOutputItems, setCellOutputItems] = useState<TCellOutputState>({
    "0": "click the run button",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [importFromProcess, setImportFromProcess] = useState("");
  const [firstRun, setFirstRun] = useState(true);
  const [showInbox, setShowInbox] = useState(false);
  const [processInbox, setProcessInbox] = useState<TInboxMessage[]>([]);
  const [updatingInbox, setUpdatingInbox] = useState(false);
  const [toasts, setToasts] = useState<string[]>(["a", "b", "c"]);

  useEffect(() => {
    const activeProcess = localStorage.getItem("activeProcess");
    if (activeProcess) {
      setAOSProcess(activeProcess);
    }
    clearInterval(parseInt(sessionStorage.getItem("interval") || "0"));
    const importNotebook = searchParams.has("getcode");
    if (importNotebook) {
      const importProcess = searchParams.get("getcode")!;
      if (importProcess.length !== 43) return alert("Invalid process ID");
      setImportFromProcess(importProcess);
      importCode(importProcess);
    }
  }, []);

  useEffect(() => {
    function switchId() {
      const r = toasts.shift();
      toasts.push(r!);
      setToasts(toasts);
      console.log(r);
      return r;
    }
    async function fetchNewInbox() {
      // console.log("ran")
      if (!aosProcessId) return;
      const r = await results({
        process: aosProcessId,
        limit: 50,
        sort: "ASC",
        from: localStorage.getItem("cursor") || "",
      });
      // console.log(r)
      // console.log(r.edges)
      if (r.edges.length > 0) {
        if (!localStorage.getItem("cursor")) {
          const c = r.edges[r.edges.length - 1].cursor;
          localStorage.setItem("cursor", c);
          console.log("set cursor", c);

          return;
        }
        const c = r.edges[r.edges.length - 1].cursor;
        console.log(
          c,
          localStorage.getItem("cursor"),
          c == localStorage.getItem("cursor")
        );
        if (c == localStorage.getItem("cursor")) return;
        localStorage.setItem("cursor", c);
        console.log("updated cursor", c);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        r.edges.forEach((msg: any) => {
          // console.log(msg)
          // setCursor(msg.cursor)
          // localStorage.setItem("cursor", msg.cursor);
          const node = msg.node;
          if (node.Output.print) {
            console.log(node.Output.data);
            toast.custom(
              (t) => {
                return (
                  <div
                    className={`
                pointer-events-auto flex w-full max-w-md rounded-lg bg-[#121212] p-2 text-white opacity-80 shadow-lg ring-1 ring-white/30 transition-all duration-200 hover:right-0 hover:opacity-100 `}
                    onClick={() => toast.remove(t.id)}
                  >
                    <Ansi>{node.Output.data}</Ansi>
                  </div>
                );
              },
              { duration: 5000, id: switchId() }
            );
          }
        });
      }

      // fetchNewInbox()
    }
    // fetchNewInbox()

    sessionStorage.setItem(
      "interval",
      setInterval(fetchNewInbox, 2500).toString()
    );

    return () => {
      clearInterval(parseInt(sessionStorage.getItem("interval") || "0"));
    };
  }, [aosProcessId]);

  async function getInbox() {
    if (updatingInbox) return;
    setUpdatingInbox(true);
    const r1 = await sendMessage({
      data: `local json = require("json")
return json.encode(Inbox)`,
      processId: aosProcessId!,
    });
    const r2 = await aoResult({
      message: r1,
      process: aosProcessId!,
    });
    // console.log(r2)
    const inbox: TInboxMessage[] = JSON.parse(r2.Output.data.output);
    setProcessInbox(inbox.reverse());
    console.log(inbox);
    setUpdatingInbox(false);
  }

  useEffect(() => {
    if (!showInbox) return;
    getInbox();
  }, [aosProcessId, showInbox]);

  useEffect(() => {
    if (localStorage.getItem("notebookData") === null) {
      localStorage.setItem("notebookData", "{}");
    }
    const d = JSON.parse(localStorage.getItem("notebookData")!);

    if (aosProcessId && d) {
      if (d[aosProcessId] && firstRun) {
        setCellOrder(d[aosProcessId].cellIds);
        setCellCodeItems(d[aosProcessId].cellCodeItems);
        setCellOutputItems(d[aosProcessId].cellOutputItems);
        setFirstRun(false);
      } else {
        d[aosProcessId] = {
          cellIds,
          cellCodeItems,
          cellOutputItems,
        };
      }

      localStorage.setItem("notebookData", JSON.stringify(d));
    }
  }, [aosProcessId, cellIds, cellCodeItems, cellOutputItems]);

  // function setRunning(cellId: string) {
  //   setCellOutputItems((prev) => ({ ...prev, [cellId]: "running..." }));
  // }

  // function processSelected(pid: string) {
  //   console.log("using process", pid);
  //   setAOSProcess(pid);
  // }

  async function spawnProcess() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // await (window as any).arweaveWallet.connect([
    //   "ACCESS_ADDRESS",
    //   "SIGN_TRANSACTION",
    // ]);
    // const wallet = (window as any).arweaveWallet;
    // if (!wallet) return alert("Please install the ArConnect extension");
    // try {
    //   await wallet.getActiveAddress()
    // } catch (e) {
    //   console.log(e.message)
    //   await wallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
    // }

    if (aosProcessId) return alert("already spawned");
    setSpawning(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signer = createDataItemSigner((window as any).arweaveWallet);
    console.log(signer);
    const res = await connect().spawn({
      module: AOModule,
      scheduler: AOScheduler,
      signer,
      tags: [],
    });
    console.log(res);
    setAOSProcess(res);
    setSpawning(false);
    addNewCell();
  }

  function addNewCell() {
    const id = v4();

    setCellOrder((prev) => [...prev, id]);
    setCellCodeItems((prev) => ({ ...prev, [id]: "1 + 41" }));
    setCellOutputItems((prev) => ({ ...prev, [id]: "" }));
  }

  function deleteCell(cellId: string) {
    setCellOrder((prev) => prev.filter((id) => id !== cellId));
    setCellCodeItems((prev) => {
      delete prev[cellId];
      return prev;
    });
    setCellOutputItems((prev) => {
      delete prev[cellId];
      return prev;
    });
  }

  async function shareCode() {
    const codeArray = cellIds.map((cellId) => {
      return cellCodeItems[cellId];
    });
    console.log("backing up", codeArray);
    const codeToRun = `local json = require("json")

if not Betteridea then
    Betteridea = {
        Code = {${JSON.stringify(codeArray, null, 2).slice(1, -1)}},
        AccessedBy = {},
        LastUpdated = os.time(os.date("!*t"))
    }
else
    Betteridea.Code = {${JSON.stringify(codeArray, null, 2).slice(1, -1)}}
    Betteridea.LastUpdated = os.time(os.date("!*t"))
end

Handlers.add(
    "GetCode",
    Handlers.utils.hasMatchingTag("Action","GetCode"),
    function(msg)
        accessed_by = Betteridea.AccessedBy[msg.From]
        if not accessed_by then
            Betteridea.AccessedBy[msg.From] = {
                Count=1,
                Latest=os.time(os.date("!*t"))
            }
        else
            Betteridea.AccessedBy[msg.From] = {
                Count = accessed_by.Count+1,
                Latest=os.time(os.date("!*t"))
            }
        end
        Handlers.utils.reply(json.encode(Betteridea.Code))(msg)
    end
)
`;
    console.log(codeToRun);
    try {
      const r = await sendMessage({
        data: codeToRun,
        processId: aosProcessId!,
      });

      const res = await aoResult({
        message: r,
        process: aosProcessId!,
      });
      console.log(res.Output);
      await navigator.clipboard.writeText(
        `${window.location.origin}/?getcode=${aosProcessId}`
      );
      alert("shared and url copied to clipboard");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.log(e.message);
    }
  }

  function toggleInbox() {
    setShowInbox(!showInbox);
  }

  async function importCode(impfrom?: string) {
    const id =
      impfrom ||
      importFromProcess ||
      prompt("Enter the process ID or URL to import");
    if (!id) return;
    const procId = id.includes("?getcode=") ? id.split("?getcode=")[1] : id;
    // console.log(procId);
    if (procId.length !== 43) return alert("invalid process ID");
    console.log("importing", procId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signer = createDataItemSigner((window as any).arweaveWallet);
    const r = await connect().message({
      process: procId,
      signer,
      tags: [{ name: "Action", value: "GetCode" }],
    });
    console.log(r);
    const res = await aoResult({
      message: r,
      process: procId,
    });
    console.log(res);
    const codeData = JSON.parse(res.Messages[0].Data);
    console.log(codeData);

    const cellCount = codeData.length;
    const cellIds = [];
    const cellCodeItems: TCellCodeState = {}; // Add index signature
    const cellOutputItems: TCellOutputState = {}; // Add index signature
    for (let i = 0; i < cellCount; i++) {
      const id: string = v4();
      cellIds.push(id);
      cellCodeItems[id] = codeData[i]; // Remove unnecessary ! operator
      cellOutputItems[id] = "";
    }
    setCellOrder(cellIds);
    setCellCodeItems(cellCodeItems);
    setCellOutputItems(cellOutputItems);
    searchParams.delete("getcode");
    setSearchParams(searchParams);
    setImportFromProcess("");
  }

  return (
    <div className="relative flex h-full max-h-[calc(100vh-5rem)] w-full flex-col items-center gap-4 overflow-scroll p-4">
      {/* <div className="absolute right-2 top-2 flex h-7 gap-2">

      </div> */}

      {isSpawning && <div className="text-center">Spawning process...</div>}

      {!isSpawning && (
        <>
          {aosProcessId ? (
            <div className="w-full text-center flex flex-col gap-3 md:px-16">
              <div>
                Process ID: <pre className="inline">{aosProcessId}</pre>
              </div>
              <div className="flex gap-2 justify-between w-full">
                <div>
                  <Button
                    className={`h-7 px-3 border  ${
                      showInbox ? "bg-white" : "bg-black"
                    } border-[#252525] hover:bg-white/10`}
                    onClick={() => toggleInbox()}
                  >
                    {showInbox ? (
                      <span
                        className={`font-light ${
                          showInbox ? " text-black" : "text-white"
                        }`}
                      >
                        Process &lt;/&gt;
                      </span>
                    ) : (
                      <>
                        <span className="mr-2 font-light">Inbox</span>{" "}
                        <img src={Icons.inbox} className="h-3 w-3" />
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="h-7 px-3 border bg-black text-white border-[#252525] hover:bg-white/10"
                    onClick={() => importCode()}
                  >
                    <span className="mr-2 font-light">Import</span>{" "}
                    <img src={Icons.import} className="h-3 w-3" />
                  </Button>
                  {cellIds.length > 0 && (
                    <Button
                      className="h-7 px-3 border bg-black text-white border-[#252525] hover:bg-white/10"
                      onClick={shareCode}
                    >
                      <span className="mr-2 font-light">Share</span>{" "}
                      <img src={Icons.share} className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="-mx-4 border-b border-[#333333]" />
            </div>
          ) : (
            <Button onClick={spawnProcess}>spawn new process</Button>
          )}
        </>
      )}

      {/* <select className="p-1 rounded" defaultValue={""} onChange={(e) => processSelected(e.target.value)}>
        <option disabled value={""}>select a process</option>
        {myProcesses.map((processId) => {
          return <option key={processId} value={processId}>{processId}</option>
        })}
      </select> */}

      {showInbox ? (
        <>
          <div className="text-xl tracking-wide">
            Inbox
            <Button
              variant="ghost"
              className="p-0 hover:bg-transparent"
              size="icon"
              onClick={getInbox}
            >
              {updatingInbox ? (
                <Icons.codeRunning className="h-3 w-3 p-0 animate-spin" />
              ) : (
                <Icons.refresh className="h-3 w-3 p-0" />
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {processInbox.map((msg: TInboxMessage, _) => (
              <div
                key={_}
                className="text-sm font-mono bg-black/30 p-2 px-4 rounded-lg border border-[#333333] max-w-[80vw] w-[80vw] text-white/50"
              >
                <span className="text-red-300/50 text-xs">
                  {tsToDate(msg.Timestamp)}{" "}
                </span>
                <br />
                <span className="text-white/70">{msg.From}</span>:{" "}
                <span className={msg.Data ? "text-green-300" : "text-white/30"}>
                  {msg.Data ? msg.Data : "Message Without Data Field"}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {aosProcessId
            ? cellIds.map((cellId) => {
                return (
                  <CodeCell
                    key={cellId}
                    cellId={cellId}
                    aosProcess={aosProcessId!}
                    cellCodeItems={cellCodeItems}
                    cellOutputItems={cellOutputItems}
                    setCellCodeItems={setCellCodeItems}
                    setCellOutputItems={setCellOutputItems}
                    deleteCell={deleteCell}
                    setActiveCell={setActiveCell}
                    activeCellId={activeCell!}
                  />
                );
              })
            : "Create a process to run code"}
          {aosProcessId && (
            <Button onClick={addNewCell}>
              <Icons.add className="text-black" color="#000000aa" /> add new
              cell
            </Button>
          )}
        </>
      )}
    </div>
  );
}

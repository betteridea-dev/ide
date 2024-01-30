import { Editor, useMonaco } from "@monaco-editor/react";
import theme from "../themes/notebook.json";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import {
  connect,
  createDataItemSigner,
  result as aoResult,
  results
} from "@permaweb/aoconnect";
import { Icons } from "./icons";
import Ansi from "ansi-to-react";
import { AOModule, AOScheduler } from "../../config";
import { Button } from "./ui/button";
import { useSearchParams } from "react-router-dom";

interface TCellCodeState {
  [key: string]: string;
}

interface TCellOutputState {
  [key: string]: string;
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

function CodeCell({
  cellId,
  aosProcess,
  cellCodeItems,
  cellOutputItems,
  setCellCodeItems,
  setCellOutputItems,
  deleteCell,
  setActiveCell,
}: {
  cellId: string;
  aosProcess: string;
  cellCodeItems: TCellCodeState;
  setCellCodeItems: React.Dispatch<React.SetStateAction<TCellCodeState>>;
  cellOutputItems: TCellOutputState;
  setCellOutputItems: React.Dispatch<React.SetStateAction<TCellOutputState>>;
  deleteCell: (val: string) => void;
  setActiveCell: (val: string) => void;
}) {
  const [codeStatus, setCodeStatus] = useState<
    "success" | "error" | "running" | "default"
  >("default");

  async function executeCode() {
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

      const formattedOutput = `${JSON.stringify(res.Output.data.output, null, 2) ||
        res.Output.data.output
        }`;

      setCellOutputItems((prev) => ({ ...prev, [cellId]: formattedOutput }));
      setCodeStatus("success");
    } catch (e) {
      console.log(e);
      setCellOutputItems((prev) => ({
        ...prev,
        [cellId]: e.message ?? "Error executing this snippet",
      }));

      setCodeStatus("error");
    }
  }

  return (
    <div className="flex flex-col w-full justify-center max-w-[calc(90vw-12rem)] overflow-x-clip rounded-lg">
      <div className="flex flex-row gap-4 bg-[#093E49] px-4 py-6">
        <Button variant="ghost" size="icon" onClick={executeCode}>
          <Icons.executeCode className="h-6 w-6" />
        </Button>

        <div className="flex-grow min-h-[52px] rounded-sm overflow-clip">
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
                [cellId]: value,
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

      <div className="flex flex-row gap-4 min-h-[32px] bg-[#093E49]/40 px-4 py-3">
        <div className="min-h-[32px] min-w-[30px] flex justify-center items-center">
          {codeStatus == "running" && <Icons.codeRunning className="h-4 w-4" />}
          {codeStatus == "success" && <Icons.codeSuccess className="h-4 w-4" />}
          {codeStatus == "error" && <Icons.codeError className="h-4 w-4" />}
        </div>

        <pre className="p-2 ring-white/5 overflow-scroll min-h-[32px] max-h-[300px] flex-grow mx-2">
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
  const [cellIds, setCellOrder] = useState<string[]>([]);
  const [cellCodeItems, setCellCodeItems] = useState<TCellCodeState>({});
  const [cellOutputItems, setCellOutputItems] = useState<TCellOutputState>({});
  const [searchParams, setSearchParams] = useSearchParams()
  const [importFromProcess, setImportFromProcess] = useState("")

  useEffect(() => {
    const activeProcess = localStorage.getItem("activeProcess");
    if (activeProcess) {
      setAOSProcess(activeProcess);
    }
    const importNotebook = searchParams.has("getcode")
    if (importNotebook) {
      const importProcess = searchParams.get("getcode")
      if (importProcess.length !== 43) return alert("Invalid process ID")
      setImportFromProcess(importProcess)
      importCode(importProcess)
    }
  }, []);

  function setRunning(cellId: string) {
    setCellOutputItems((prev) => ({ ...prev, [cellId]: "running..." }));
  }

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
      console.log("running", activeCell);
      try {
        setRunning(activeCell);
        const r = await sendMessage({
          data: cellCodeItems[activeCell],
          processId: aosProcessId,
        });
        // REMOVE THE ANY LATER WHEN TYPES ARE FIXED ON AO-CONNECT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await aoResult({
          message: r,
          process: aosProcessId,
        });

        console.log(res);

        const formattedOutput = `${JSON.stringify(res.Output.data.output, null, 2) ||
          res.Output.data.output
          }`;
        console.log(formattedOutput);
        setCellOutputItems((prev) => ({
          ...prev,
          [activeCell]: formattedOutput,
        }));
      } catch (e) {
        console.log(e.message);
      }
    },
  });

  function processSelected(pid: string) {
    console.log("using process", pid);
    setAOSProcess(pid);
  }

  async function spawnProcess() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (window as any).arweaveWallet.connect([
      "ACCESS_ADDRESS",
      "SIGN_TRANSACTION",
    ]);
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
    })
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
`
    console.log(codeToRun);
    try {
      const r = await sendMessage({ data: codeToRun, processId: aosProcessId });

      const res = await aoResult({
        message: r,
        process: aosProcessId,
      });
      console.log(res.Output)
      await navigator.clipboard.writeText(`${window.location.origin}/?getcode=${aosProcessId}`);
      alert("shared and url copied to clipboard")

    }
    catch (e) {
      console.log(e.message)
    }
  }

  async function importCode(impfrom?: string) {
    const id = impfrom || importFromProcess || prompt("Enter the process ID or URL to import");
    if (!id) return;
    const procId = id.includes("?getcode=") ? id.split("?getcode=")[1] : id;
    // console.log(procId);
    if (procId.length !== 43) return alert("invalid process ID");
    console.log("importing", procId);
    const signer = createDataItemSigner((window as any).arweaveWallet);
    const r = await connect().message({
      process: procId,
      signer,
      tags: [{ name: "Action", value: "GetCode" }],
    });
    console.log(r)
    const res = await aoResult({
      message: r,
      process: procId,
    });
    console.log(res)
    const codeData = JSON.parse(res.Messages[0].Data)
    console.log(codeData)

    const cellCount = codeData.length;
    const cellIds = [];
    const cellCodeItems = {};
    const cellOutputItems = {};
    for (let i = 0; i < cellCount; i++) {
      const id = v4();
      cellIds.push(id);
      cellCodeItems[id] = codeData[i];
      cellOutputItems[id] = "";
    }
    setCellOrder(cellIds);
    setCellCodeItems(cellCodeItems);
    setCellOutputItems(cellOutputItems);
    searchParams.delete("getcode")
    setSearchParams(searchParams)
    setImportFromProcess("")
  }

  return (
    <div className="relative h-full w-full max-h-[calc(100vh-5rem)] overflow-scroll flex flex-col gap-4 items-center p-4">
      <div className="absolute right-2 top-2 h-7 flex gap-2" >
        {aosProcessId && <Button className="h-7" onClick={() => importCode()}>import</Button>}
        {cellIds.length > 0 && <Button className="h-7" onClick={shareCode}>share</Button>}
      </div>

      {isSpawning && <div className="text-center">Spawning process...</div>}

      {!isSpawning && (
        <>
          {aosProcessId ? (
            <div className="text-center">
              Process ID: <pre className="inline">{aosProcessId}</pre>
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

      {cellIds.map((cellId) => {
        return (
          <CodeCell
            key={cellId}
            cellId={cellId}
            aosProcess={aosProcessId}
            cellCodeItems={cellCodeItems}
            cellOutputItems={cellOutputItems}
            setCellCodeItems={setCellCodeItems}
            setCellOutputItems={setCellOutputItems}
            deleteCell={deleteCell}
            setActiveCell={setActiveCell}
          />
        );
      })}

      {aosProcessId && (
        <Button onClick={addNewCell}>
          <Icons.add className="text-black" color="#000000aa" /> add new cell
        </Button>
      )}
    </div>
  );
}

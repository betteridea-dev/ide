import { Editor, useMonaco } from "@monaco-editor/react";
import theme from "../themes/merbivore-modified.json";
import { useState } from "react";
import runIcon from "../assets/run.svg";
import { v4 } from "uuid";
import {
  connect,
  createDataItemSigner,
  result as aoResult,
} from "@permaweb/ao-connect";
import runningIcon from "../assets/running.webp";
import { Icons } from "./icons";

interface TCellCodeState {
  [key: string]: string;
}

interface TCellOutputState {
  [key: string]: string;
}

function CodeCell({
  cellId,
  aosProcess,
  cellCodeItems,
  cellOutputItems,
  setCellCodeItems,
  setCellOutputItems,
  deleteCell,
}: {
  cellId: string;
  aosProcess: string;
  cellCodeItems: TCellCodeState;
  setCellCodeItems: React.Dispatch<React.SetStateAction<TCellCodeState>>;
  cellOutputItems: TCellOutputState;
  setCellOutputItems: React.Dispatch<React.SetStateAction<TCellOutputState>>;
  deleteCell: (val: string) => void;
}) {
  const [running, setRunning] = useState(false);

  function sendMessage({ data }: { data: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signer = createDataItemSigner((window as any).arweaveWallet);
    return connect().message({
      process: aosProcess,
      signer,
      tags: [{ name: "Action", value: "Eval" }],
      data,
    });
  }

  async function run() {
    setRunning(true);

    // const codeToRun = editorRef.current.getValue();
    const codeToRun = cellCodeItems[cellId];
    console.log("sending message", codeToRun);

    try {
      const r = await sendMessage({ data: codeToRun });
      console.log(r);

      // REMOVE THE ANY LATER WHEN TYPES ARE FIXED ON AO-CONNECT
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await aoResult({
        message: r,
        process: aosProcess,
      });

      console.log(res);

      const formattedOutput = `${JSON.stringify(res.Output.data.output, null, 2) ||
        res.Output.data.output
        }`;

      setCellOutputItems((prev) => ({ ...prev, [cellId]: formattedOutput }));
    } catch (e) {
      console.log(e.message);
      setCellOutputItems((prev) => ({
        ...prev,
        [cellId]: e.message ?? "Error executing this snipper",
      }));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex my-3 flex-col max-w-[99%] ring-1 ring-white/10">
      <div className="flex min-h-[50px]">
        <button className="min-h-[50px] max-h-[50px] min-w-[30px] flex justify-center items-center pl-[5px]" onClick={run}>
          <img src={runIcon} className="w-8 h-8" />
        </button>
        <Editor
          className="max-h-[380px] max-w-full min-h-[50px]"
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
          }}
          options={{
            minimap: { enabled: false },
            // lineNumbers: "off",
            lineNumbersMinChars: 2,
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
          }}
        />
        <button className="min-h-[50px] max-h-[50px] min-w-[30px] flex justify-center items-center" onClick={() => deleteCell(cellId)}>
          <Icons.delete size={20} />
        </button>
      </div>
      <div className="flex min-h-[50px] bg-[#3D4947]/20">
        <div className="min-h-[50px] min-w-[30px] flex justify-center items-center pl-[5px]">
          <img src={runningIcon} className={`max-w-[20px] max-h-[20px] ${!running && "hidden"}`} />
        </div>
        <pre className="p-2 ring-white/5 overflow-scroll min-h-[50px] max-h-[300px] w-full">
          {cellOutputItems[cellId]}
        </pre>
        <div className="min-w-[30px]">

        </div>
      </div>
    </div>
  );
}

export default function AONotebook() {
  const [isSpawning, setSpawning] = useState<boolean>(false);
  const [aosProcessId, setAOSProcess] = useState<string | null>(null);

  const [cellIds, setCellOrder] = useState<string[]>([]);
  const [cellCodeItems, setCellCodeItems] = useState<TCellCodeState>({});
  const [cellOutputItems, setCellOutputItems] = useState<TCellOutputState>({});

  const monaco = useMonaco();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco?.editor.defineTheme("merbivore", theme as any);

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
      module: "MGUZ35GzZAlSFno6oeR0yb9Og1gPrSRDlp00G0wlXQE",
      scheduler: "TZ7o7SIZ06ZEJ14lXwVtng1EtSx60QkPy-kh-kdAXog",
      signer,
      tags: [],
    });
    console.log(res);
    setAOSProcess(res);
    setSpawning(false);
  }

  function addNewCell() {
    const id = v4();

    setCellOrder((prev) => [...prev, id]);
    setCellCodeItems((prev) => ({ ...prev, [id]: "1+1" }));
    setCellOutputItems((prev) => ({ ...prev, [id]: "..." }));
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

  return (
    <div className="h-[94vh] max-w-[90vw] p-2 overflow-scroll flex flex-col">
      <div className="text-xl text-center">Welcome to AO Playground!</div>

      {isSpawning && <div className="text-center">Spawning process...</div>}

      {!isSpawning && (
        <>
          {aosProcessId ? (
            <div className="text-center">
              Process ID: <pre className="inline">{aosProcessId}</pre>
            </div>
          ) : (
            <button className="bg-white text-black text-center px-3 text-lg mx-auto m-2" onClick={spawnProcess}>spawn process</button>
          )}
        </>
      )}

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
          />
        );
      })}

      {aosProcessId && <button
        onClick={addNewCell}
        className="bg-white text-black text-center px-3 font-bold text-xl mx-auto"
      >
        +
      </button>}
    </div>
  );
}

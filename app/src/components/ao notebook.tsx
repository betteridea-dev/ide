import { Editor, useMonaco } from "@monaco-editor/react";
import theme from "../themes/merbivore-modified.json";
import { useEffect, useState } from "react";
import runIcon from "../assets/run.svg";
import { v4 } from "uuid";
import {
  connect,
  createDataItemSigner,
  result as aoResult,
} from "@permaweb/aoconnect";
import runningIcon from "../assets/running.webp";
import { Icons } from "./icons";
import { gql, GraphQLClient } from "graphql-request"
import Ansi from "ansi-to-react";
import { AOModule, AOScheduler } from "../../config";

interface TCellCodeState {
  [key: string]: string;
}

interface TCellOutputState {
  [key: string]: string;
}

function sendMessage({ data, processId }: { data: string, processId: string }) {
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
  setActiveCell
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
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);

    // const codeToRun = editorRef.current.getValue();
    const codeToRun = cellCodeItems[cellId];
    console.log("sending message", codeToRun);

    try {
      const r = await sendMessage({ data: codeToRun, processId: aosProcess });
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
      console.log(formattedOutput)
      setCellOutputItems((prev) => ({ ...prev, [cellId]: formattedOutput }));
    } catch (e) {
      console.log(e);
      setCellOutputItems((prev) => ({
        ...prev,
        [cellId]: e.message ?? "Error executing this snippet",
      }));
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex my-3 flex-col w-full max-w-[calc(100vw-80px)] ring-1 ring-white/10">
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
        <button className="min-h-[50px] max-h-[50px] min-w-[30px] flex justify-center items-center" onClick={() => deleteCell(cellId)}>
          <Icons.delete size={20} />
        </button>
      </div>
      <div className="flex min-h-[50px] bg-[#3D4947]/20">
        <div className="min-h-[50px] min-w-[30px] flex justify-center items-center pl-[5px]">
          <img src={runningIcon} className={`max-w-[20px] max-h-[20px] ${!running && "hidden"}`} />
        </div>
        <pre className="p-2 ring-white/5 overflow-scroll min-h-[50px] max-h-[300px]">
          {
            (() => {
              try { return <Ansi>{`${JSON.parse(cellOutputItems[cellId])}`}</Ansi> }
              catch (e) {
                console.log(e.message)
                return `${cellOutputItems[cellId]}`
              }
            })()
          }
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

  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [cellIds, setCellOrder] = useState<string[]>([]);
  const [cellCodeItems, setCellCodeItems] = useState<TCellCodeState>({});
  const [cellOutputItems, setCellOutputItems] = useState<TCellOutputState>({});

  const [myProcesses, setMyProcesses] = useState<string[]>([]);

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
        const r = await sendMessage({ data: cellCodeItems[activeCell], processId: aosProcessId });
        // REMOVE THE ANY LATER WHEN TYPES ARE FIXED ON AO-CONNECT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await aoResult({
          message: r,
          process: aosProcessId,
        });

        console.log(res);

        const formattedOutput = `${JSON.stringify(res.Output.data.output, null, 2) || res.Output.data.output}`;
        console.log(formattedOutput)
        setCellOutputItems((prev) => ({ ...prev, [activeCell]: formattedOutput }));
      } catch (e) {
        console.log(e.message);
      }
    },
  });

  useEffect(() => {
    const client = new GraphQLClient("https://arweave.net/graphql")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = gql`
  query($address: [String!]!) {
    transactions(
      owners: $address
      tags: [
        {
          name: "Data-Protocol",
          values: ["ao"]
        },
        {
          name: "Type",
          values: ["Process"]
        }
      ]
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
`
    async function fetchProcesses() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const address = await (window as any).arweaveWallet.getActiveAddress()
      const res = await client.request(query, { address })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMyProcesses((res as any).transactions.edges.map((edge: any) => edge.node.id))
    }
    fetchProcesses()
  }, [])

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

  return (
    <div className="h-[calc(100vh-40px)] w-full p-2 overflow-scroll flex flex-col items-center">
      <div className="text-xl text-center">Welcome to AO Notebook!</div>

      {isSpawning && <div className="text-center">Spawning process...</div>}

      {!isSpawning && (
        <>
          {aosProcessId ? (
            <div className="text-center">
              Process ID: <pre className="inline">{aosProcessId}</pre>
            </div>
          ) : (
            <button className="bg-white text-black text-center px-3 text-lg mx-auto m-2" onClick={spawnProcess}>spawn new process</button>
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

      {aosProcessId && <button
        onClick={addNewCell}
        className="bg-white text-black text-center px-3 font-bold text-xl mx-auto"
      >
        + add cell
      </button>}
    </div>
  );
}

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
import { gql, GraphQLClient } from "graphql-request";
import Ansi from "ansi-to-react";
import { AOModule, AOScheduler } from "../../config";
import { Button } from "./ui/button";

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

      const formattedOutput = `${
        JSON.stringify(res.Output.data.output, null, 2) ||
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
              console.log(e.message);
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

        const formattedOutput = `${
          JSON.stringify(res.Output.data.output, null, 2) ||
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

  useEffect(() => {
    const client = new GraphQLClient("https://arweave.net/graphql");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = gql`
      query ($address: [String!]!) {
        transactions(
          owners: $address
          tags: [
            { name: "Data-Protocol", values: ["ao"] }
            { name: "Type", values: ["Process"] }
          ]
        ) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;
    async function fetchProcesses() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const address = await (window as any).arweaveWallet.getActiveAddress();
      const res = await client.request(query, { address });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMyProcesses(
        (res as any).transactions.edges.map((edge: any) => edge.node.id)
      );
    }
    fetchProcesses();
  }, []);

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

  return (
    <div className="h-full w-full overflow-scroll flex flex-col gap-4 items-center p-4">
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
          <Icons.add className="text-black" /> add new cell
        </Button>
      )}
    </div>
  );
}

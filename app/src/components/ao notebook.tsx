import { Editor, useMonaco } from "@monaco-editor/react";
import theme from "../themes/merbivore-modified.json";
import { useEffect, useState } from "react";
import runIcon from "../assets/run.svg";
import { v4 } from "uuid";
import {
  connect,
  createDataItemSigner,
  result as aoResult,
} from "@permaweb/ao-connect";
import runningIcon from "../assets/running.webp";

interface CellData {
  [key: string]: {
    code: string;
    result: string;
  };
}

export default function AONotebook() {
  const [spawning, setSpawning] = useState(false);
  const [aosProcess, setAOSProcess] = useState(null);

  const [cellData, setCellData] = useState<CellData>({});
  const [cellOrder, setCellOrder] = useState<string[]>([]);

  const [cellItemsCode, setCellItemsCode] = useState<{
    [key: string]: string;
  }>({});

  const [cellItemsResult, setCellItemsResult] = useState<{
    [key: string]: string;
  }>({});

  const monaco = useMonaco();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco?.editor.defineTheme("merbivore", theme as any);

  async function spawnProcess() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (window as any).arweaveWallet.connect([
      "ACCESS_ADDRESS",
      "SIGN_TRANSACTION",
    ]);
    if (aosProcess) return alert("already spawned");
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

  function addCell() {
    const id = v4();
    setCellOrder((prev) => [...prev, id]);

    setCellItemsCode((prev) => ({ ...prev, [id]: "1+1" }));
    setCellItemsResult((prev) => ({ ...prev, [id]: "..." }));

    // setCellData((prev) => ({ ...prev, [id]: { code: "", result: "" } }));
  }

  function updateCellDataItem(cellId: string, updatedData: CellData[string]) {
    setCellData((prev) => {
      const data = { ...prev };

      data[cellId] = updatedData;

      return data;
    });
  }

  function Cell({ cellId }: { cellId: string }) {
    // const [code, setCode] = useState(cellData[cellId]?.code || "1+1");
    // const [result, setResult] = useState(cellData[cellId]?.result || "...");
    const [running, setRunning] = useState(false);

    async function run() {
      setRunning(true);
      console.log("sending message", cellItemsCode[cellId]);
      try {
        const r = await sendMessage({ data: cellItemsCode[cellId] });
        console.log(r);
        // REMOVE THE ANY LATER WHEN TYPES ARE FIXED ON AO-CONNECT
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await aoResult({
          message: r,
          process: aosProcess,
        });
        setRunning(false);
        console.log(res);
        // setResult(
        //   `${
        //     JSON.stringify(res.Output.data.output, null, 2) ||
        //     res.Output.data.output
        //   }`
        // );

        const output = `${
          JSON.stringify(res.Output.data.output, null, 2) ||
          res.Output.data.output
        }`;

        setCellItemsResult((prev) => ({ ...prev, [cellId]: output }));

        // updateCellDataItem(cellId, { code: code, result: result });
      } catch (e) {
        console.log(e.message);
        // setResult(e.message);
        setRunning(false);
      }
    }

    // useEffect(() => {
    // NEED FIXING, HELP @PRATHAMESH
    // setting code and result from here will result in an infinite render loop
    // setCellData({ ...cellData, [cellId]: { code, result } })
    // }, [code, result]);

    return (
      <div className="flex bg-black/10 p-2 gap-2 ring-1 ring-white/5 my-3">
        <div className="flex flex-col items-center gap-1 min-w-fit">
          <button className="text-xl block" onClick={run}>
            <img src={runIcon} className="w-8 h-8 block" />
          </button>

          {running && <img src={runningIcon} className="w-5 h-5 block" />}
        </div>

        <div className="flex flex-col text-left w-[100%] gap-2">
          <Editor
            className="w-full max-w-[85vw] max-h-[380px]"
            language="lua"
            theme="merbivore"
            height={
              cellItemsCode[cellId].split("\n").length > 20
                ? 20 * 19
                : cellItemsCode[cellId].split("\n").length * 19
            }
            onChange={(value) => {
              //   setCode(value);
              //   updateCellDataItem(cellId, { code: value, result: result });
              setCellItemsCode((prev) => ({ ...prev, [cellId]: value }));
            }}
            value={cellItemsCode[cellId]}
            options={{
              minimap: { enabled: false },
              // lineNumbers: "off",
              lineNumbersMinChars: 2,
              scrollBeyondLastLine: false,
              renderLineHighlight: "none",
            }}
          />

          <pre className="p-0.5 ring-1 ring-white/5 overflow-scroll max-h-[40%] max-w-[99%]">
            {cellItemsResult[cellId]}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[94vh] max-w-[90vw] p-2 overflow-scroll flex flex-col">
      <div className="text-xl text-center">Welcome to AO Playground!</div>

      {spawning && <div className="text-center">Spawning process...</div>}

      {!spawning && (
        <>
          {aosProcess ? (
            <div className="text-center">
              Process ID: <pre className="inline">{aosProcess}</pre>
            </div>
          ) : (
            <button onClick={spawnProcess}>spawn process</button>
          )}
        </>
      )}

      {cellOrder.map((cellId) => {
        return <Cell key={cellId} cellId={cellId} />;
      })}

      <button
        onClick={addCell}
        className="bg-white text-black text-center px-3 font-bold text-xl mx-auto"
      >
        +
      </button>
    </div>
  );
}

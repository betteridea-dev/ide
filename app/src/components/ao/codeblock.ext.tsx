import { Editor, useMonaco } from "@monaco-editor/react";
import theme from "../../../themes/notebook.json";
import { useEffect, useState } from "react";
import { connect, createDataItemSigner, result as aoResult } from "@permaweb/aoconnect";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Ansi from "ansi-to-react";
import { AOModule, AOScheduler } from "@/../config";
import { useSearchParams } from "react-router-dom";

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

async function executeCode({ aosProcess, codeToRun, setOutput, setCodeStatus }: { aosProcess: string; codeToRun: string; setOutput: React.Dispatch<React.SetStateAction<string>>; setCodeStatus: React.Dispatch<React.SetStateAction<"success" | "error" | "running" | "default">> }) {
  setCodeStatus("running");

  // const codeToRun = editorRef.current.getValue();
  console.log("sending message", codeToRun);

  try {
    const r = await sendMessage({ data: codeToRun, processId: aosProcess });

    // REMOVE THE ANY LATER WHEN TYPES ARE FIXED ON AO-CONNECT
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res: any = await aoResult({
      message: r,
      process: aosProcess,
    });

    // if (res.Messages.length > 0 && res.Messages[0].Target && res.Messages[0].Target == _0RBT) {
    //     postToOrbit(true)
    //     console.log("0rbit detected")
    // } else {
    //     postToOrbit(false)
    //     console.log("no 0rbit")
    // }

    const formattedOutput = `${JSON.stringify(res.Output.data.output, null, 2) || res.Output.data.output}`;

    // setCellOutputItems((prev) => ({ ...prev, [cellId]: formattedOutput }));
    setOutput(formattedOutput);
    setCodeStatus("success");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(e);
    // setCellOutputItems((prev) => ({
    //     ...prev,
    //     [cellId]: e.message ?? "Error executing this snippet",
    // }));
    setOutput(e.message ?? "Error executing this snippet");

    setCodeStatus("error");
  }
}

function CodeCell({ aosProcess }: { aosProcess: string }) {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState<string>(searchParams.get("codeblock") || "print('Hello, World!')");
  const [output, setOutput] = useState<string>("");
  const [codeStatus, setCodeStatus] = useState<"success" | "error" | "running" | "default">("default");
  const [timeoutId, setTimeoutId] = useState<any>(0);

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
      console.log("running from keybind");

      executeCode({
        aosProcess,
        codeToRun: code,
        setOutput,
        setCodeStatus,
      });
    },
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callback = (e: any) => {
      if (e.origin == "http://localhost:5173") return;
      console.log(e);
      if (e.data.action == "run") {
        executeCode({
          aosProcess,
          codeToRun: code,
          setOutput,
          setCodeStatus,
        });
      }
    };

    window.removeEventListener("message", callback);
    window.addEventListener("message", callback);
    return () => {
      window.removeEventListener("message", callback);
    };
  }, [code, aosProcess]);

  return (
    <div className="flex h-[100vh] flex-col justify-center overflow-x-clip rounded-lg border border-[#323232] bg-[#1d1d1d]">
      <div className="flex h-[100vh] flex-row gap-4 bg-black/70 border-b border-[#323232] px-4 py-6 rounded-t-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            executeCode({
              aosProcess,
              codeToRun: code,
              setOutput,
              setCodeStatus,
            })
          }
        >
          <Icons.executeCode className="h-6 w-6" />
        </Button>

        <div className="min-h-[52px] flex-grow overflow-clip rounded-sm">
          <Editor
            className="min-h-[52px]"
            language="lua"
            theme="merbivore"
            // height={
            //     (code.split("\n").length > 10
            //         ? 10
            //         : code.split("\n").length) * 19
            // }
            defaultValue={code}
            onChange={(value) => setCode(value!)}
            options={{
              minimap: { enabled: false },
              // lineNumbers: "off",
              lineNumbersMinChars: 2,
              scrollBeyondLastLine: false,
              renderLineHighlight: "none",
            }}
          />
        </div>

        {/* <Button variant="ghost" size="icon" onClick={() => deleteCell(cellId)}>
                    <Icons.delete className="h-6 w-6" />
                </Button> */}
      </div>

      <div className="flex min-h-[100px] flex-row gap-4 bg-[#050505]/40 px-4 py-3 rounded-b-lg">
        <div className="flex min-h-[30px] min-w-[30px] items-center justify-center">
          {codeStatus == "running" && <Icons.codeRunning className="h-4 w-4  animate-spin" />}
          {codeStatus == "success" && <Icons.codeSuccess className="h-4 w-4" />}
          {codeStatus == "error" && <Icons.codeError className="h-4 w-4" />}
        </div>

        <pre className="mx-2  flex-grow overflow-scroll p-2 ring-white/5">
          {(() => {
            try {
              return <Ansi>{`${JSON.parse(output)}`}</Ansi>;
            } catch (e) {
              // console.log(e.message);
              return `${output}`;
            }
          })()}
        </pre>

        <div className="min-w-[30px]"></div>
      </div>
    </div>
  );
}

export default function CodeBlockExt() {
  const [walletAddr, setWalletAddr] = useState<string>("");
  const [aosProcess, setAosProcess] = useState<string>(localStorage.getItem("betteridea-process") || "");
  const [spawning, setSpawning] = useState<boolean>(false);
  // const [cellCode, setCellCode] = useState<string>("");
  // const [cellOutput, setCellOutput] = useState<string>("");

  window.addEventListener("storage", (e) => {
    // console.log(e)
    // if (e.key === "betteridea-process") {
    //     console.log("storage update: ", e.newValue);
    //     setAosProcess(e.newValue ?? "");
    // }
    const localPid = localStorage.getItem("betteridea-process");
    console.log("storage update: ", localPid);
    setAosProcess(localPid || "");
  });

  return (
    <div className="betteridea-codeblock min-h-[130px] w-full bg-transparent">
      {aosProcess ? (
        <CodeCell aosProcess={aosProcess} />
      ) : (
        <>
          {!walletAddr && (
            <Button
              className="m-1"
              variant="outline"
              onClick={async () => {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const addr = await (window as any).arweaveWallet.getActiveAddress();
                  setWalletAddr(addr);
                } catch {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await (window as any).arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
                }
              }}
            >
              {walletAddr || "connect wallet"}
            </Button>
          )}
          {walletAddr && (
            <Button
              className="m-1"
              variant="outline"
              disabled={spawning}
              onClick={async () => {
                if (!walletAddr) return alert("connect wallet first");
                if (aosProcess) return alert("already spawned");
                setSpawning(true);
                const r = await connect().spawn({
                  module: AOModule,
                  scheduler: AOScheduler,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  signer: createDataItemSigner((window as any).arweaveWallet),
                  tags: [],
                  data: "",
                });
                console.log("new process", r);
                // setAosProcess(r);
                localStorage.setItem("betteridea-process", r);
                dispatchEvent(new Event("storage"));
                setSpawning(false);
              }}
            >
              {spawning ? "spawning..." : "Spawn Process"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}

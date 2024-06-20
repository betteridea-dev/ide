import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { runLua, spawnProcess, getResults, parseOutupt } from "@/lib/ao-vars";
import Image from "next/image";
import Icons from "@/assets/icons";
import { Editor } from "@monaco-editor/react";
import notebookTheme from "@/monaco-themes/notebook.json";
import { editor } from "monaco-editor";
import Ansi from "ansi-to-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { GraphQLClient, gql } from "graphql-request";
import { useTheme } from "next-themes";
import crypto from "crypto";
import Link from "next/link";

var codeproxy = "";
export default function CodeCell() {
  const searchParams = useSearchParams();
  const [walletAddr, setWalletAddr] = useState<string>("");
  const [aosProcess, setAosProcess] = useState<string>("");
  const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", undefined, { initializeWithValue: true });
  const [spawning, setSpawning] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [code, setCode] = useState<string>('print("Hello AO!")');
  const [output, setOutput] = useState<string>("");
  const [appname, setAppname] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    console.log("autoconn", autoconnect);

    if (searchParams.size > 0) {
      if (searchParams.has("code")) {
        setCode(searchParams.get("code") as string);
        console.log("CODE:", searchParams.get("code"));
      } else {
        setCode('print("Hello AO!")');
      }
      if (searchParams.has("app-name")) {
        const appnameProxy = searchParams.get("app-name") as string;
        if (appnameProxy.length > 0) {
          setAppname(appnameProxy);
          console.log("APP:", searchParams.get("app-name"));
        } else {
          setAppname("Unnamed");
        }
      } else {
        setAppname("Unnamed");
        setCode('print("Hello AO!")');
      }
    }
    async function run() {
      if (autoconnect && !mounted) {
        try {
          const addr = await window.arweaveWallet.getActiveAddress();
          setWalletAddr(addr);
          setAutoconnect(true);
        } catch (e) {
          console.log(e);
          // setAutoconnect(false);
        }
      }
    }
    run();
  }, [searchParams, autoconnect, mounted]);

  async function connectHandler() {
    if (!window) return;
    const wallet = window.arweaveWallet;
    if (!wallet) return toast("Please install the ArConnect extension");

    await wallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
    const addr = await wallet.getActiveAddress();
    setWalletAddr(addr);
    setAutoconnect(true);
  }

  useEffect(() => {
    if (!walletAddr) return;
    console.log(walletAddr);
    spawnProcessHandler();
  }, [walletAddr]);

  useEffect(() => {
    if (!aosProcess) return;
    //send aosProcess to parent
    if (window.parent) {
      window.parent.postMessage({ action: "set_process", process: aosProcess }, "*");
    }
  }, [aosProcess]);

  async function spawnProcessHandler() {
    setSpawning(true);
    // const r = await spawnProcess();
    // setAosProcess(r);
    // setSpawning(false);
    var url = window.location != window.parent.location ? document.referrer : document.location.href;
    // get only domain name of the referrer
    const hostname = new URL(url).hostname;
    const hostnameHash = crypto.createHash("sha256").update(hostname).digest("hex");
    console.log("hostname", hostname);
    const prcName = `${appname}-BetterIDEa-CodeCell-${hostnameHash}`;

    const client = new GraphQLClient("https://arweave.net/graphql");

    const queryToFetchAlreadyCreatedProcess = gql`
    query {
  transactions(
    owners: "${walletAddr}"
    tags: [
      { name: "Data-Protocol", values: ["ao"] }
      { name: "Type", values: ["Process"] }
      { name: "Name", values: ["${prcName}"] }
    ]
  ) {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
}
    `;
    const res: any = await client.request(queryToFetchAlreadyCreatedProcess);

    const ids = res.transactions.edges.map((edge: any) => ({
      label: `${edge.node.tags[2].value} (${edge.node.id})`,
      value: edge.node.id,
    }));
    // console.log(ids)

    if (ids.length == 0) {
      console.log("No process found, creating one");
      // const loc = window.location.origin + window.location.pathname;
      // console.log(loc)
      const r = await spawnProcess(`${prcName}`, [
        { name: "External-App-Name", value: appname },
        { name: "External-Url", value: `${btoa(url)}` },
        { name: "File-Type", value: "External-Code-Cell" },
      ]);
      if (r) {
        setAosProcess(r);
        setSpawning(false);
        console.log("Process created", r);
      }
    } else {
      console.log("Found existing process using", ids[0].value);
      setAosProcess(ids[0].value);
      setSpawning(false);
    }
  }

  useEffect(() => {
    codeproxy = code;
  }, [code]);

  async function runCellCode() {
    const code_ = codeproxy;
    // const loc = window.location.origin + window.location.pathname;
    const url = window.location != window.parent.location ? document.referrer : document.location.href;
    setRunning(true);
    console.log("running", code_);
    const r = await runLua(code_, aosProcess, [
      { name: "External-App-Name", value: appname },
      { name: "External-Url", value: `${btoa(url)}` },
      { name: "File-Type", value: "External-Code-Cell" },
    ]);
    const out = parseOutupt(r);
    console.log(out);
    setOutput(out);
    setRunning(false);
  }

  useEffect(() => {
    const callback = async (e) => {
      // if (e.origin == "http://localhost:3000") return;
      // console.log(e);
      if (e.data.action == "run") {
        throw new Error("runCode has been deprecated for security reasons");
        // var url = (window.location != window.parent.location)
        //     ? document.referrer
        //     : document.location.href;
        // console.log(url)
        // console.log("running", code)
        // setRunning(true);
        // console.log("process:", aosProcess)
        // const r = await runLua(code, aosProcess, [
        //     { name: "External-App-Name", value: appname },
        //     { name: "External-Url", value: btoa(url) },
        //     { name: "File-Type", value: "External-Code-Cell" }
        // ]);
        // const out = parseOutupt(r);
        // console.log(out)
        // setOutput(out);
        // setRunning(false);
      } else if (e.data.action == "set_code") {
        setCode(e.data.code);
        setOutput("");
      } else if (e.data.action == "get_inbox") {
        const inb = await runLua("return require('json').encode(Inbox)", aosProcess, [
          { name: "External-App-Name", value: appname },
          { name: "File-Type", value: "External-Code-Cell" },
        ]);
        const out = parseOutupt(inb);
        window.parent.postMessage({ action: "inbox", data: out }, "*");
      }
    };

    window.removeEventListener("message", callback);
    window.addEventListener("message", callback);
    return () => {
      window.removeEventListener("message", callback);
    };
  }, [aosProcess, code, appname]);

  const Loader = () => {
    const [showConnectBtn, setShowConnectBtn] = useState(false);

    useEffect(() => {
      setTimeout(() => {
        setShowConnectBtn(true);
      }, 3000);
    }, []);

    return (
      <>
        {!showConnectBtn && (
          <div className="top-0 left-0 w-full h-full z-20 flex justify-center items-center" suppressHydrationWarning>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary" suppressHydrationWarning></div>
          </div>
        )}
        {showConnectBtn && (
          <Button className="w-fit absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50" onClick={connectHandler} suppressHydrationWarning>
            Connect
          </Button>
        )}
      </>
    );
  };

  return (
    <div suppressHydrationWarning className="relative h-screen w-screen overflow-clip flex flex-col justify-start p-0 bg-foreground/5">
      {aosProcess && (
        <>
          <div suppressHydrationWarning className="flex w-full h-full relative justify-start rounded-t-md border-b border-btr-grey-2/70 min-h-[69px] p-0 m-0">
            <Button suppressHydrationWarning variant="ghost" className="p-5 block h-full rounded-l rounded-b-none rounded-r-none" onClick={runCellCode}>
              <Image suppressHydrationWarning src={running ? Icons.loadingSVG : Icons.runSVG} alt="Run" data-running={running} width={30} height={30} className="data-[running=true]:animate-spin bg-foreground/10  rounded-full p-1.5 block min-w-[30px]" />
            </Button>
            <Editor
              onMount={(editor, monaco) => {
                monaco.editor.defineTheme("notebook", notebookTheme as editor.IStandaloneThemeData);
                // monaco.editor.setTheme("notebook");
                if (theme == "dark") monaco.editor.setTheme("notebook");
                else monaco.editor.setTheme("vs-light");
                // add a listener to localstorage so whever theme is updated editor theme also updates
                window.addEventListener("storage", (e) => {
                  if (e.key == "theme") {
                    if (e.newValue == "dark") monaco.editor.setTheme("notebook");
                    else monaco.editor.setTheme("vs-light");
                  }
                });
                // set keybinding to run code to shift enter
                editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, runCellCode);

                // set font family
                editor.updateOptions({ fontFamily: "DM mono" });
              }}
              onChange={(value) => {
                // console.log(value);
                // const newContent = { ...file.content };
                // newContent.cells[cellId] = { ...cell, code: value };
                // manager.updateFile(project, { file, content: newContent });
                setCode(value);
              }}
              // height={(code.split("\n").length > 10 ? 10 : code.split("\n").length) * 20}
              width="95%"
              className="min-h-[68px] font-btr-code rounded-md"
              value={code}
              defaultValue={code}
              language="lua"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                // lineNumbers: "off",
                lineHeight: 20,
                lineNumbersMinChars: 2,
                scrollBeyondLastLine: false,
                scrollbar: { vertical: "hidden", horizontal: "hidden", verticalScrollbarSize: 0 },
                renderLineHighlight: "none",
              }}
            />
          </div>
          <pre suppressHydrationWarning className="w-full text-sm font-btr-code max-h-[250px] min-h-[40px] overflow-scroll p-2 ml-20 rounded-b-md">
            {<Ansi useClasses className="font-btr-code">{`${typeof output == "object" ? JSON.stringify(output, null, 2) : output}`}</Ansi>}
          </pre>
        </>
      )}
      {autoconnect ? (
        <>{!aosProcess && <Loader />}</>
      ) : (
        <div suppressHydrationWarning className="w-full h-full flex items-center justify-center">
          {" "}
          <Button suppressHydrationWarning onClick={connectHandler} className="w-fit mx-auto">
            Connect
          </Button>
        </div>
      )}
      <Link href="https://ide.betteridea.dev" target="_blank" className="absolute right-0 top-0 bottom-0 bg-[#97E771] overflow-visible">
        <div
          className="opacity-0 hover:opacity-100 cursor-pointer overflow-visible grow flex items-center justify-center h-full hover:p-1 w-2 hover:w-7 transition-all transition-duration-200"
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          onMouseMove={(e) => {
            const x = e.clientX;
            const y = e.clientY;
            const tooltip = document.getElementById("tooltip");

            // position tooltip to left of mouse
            tooltip.style.left = `${x - tooltip.offsetWidth - 15}px`;
            tooltip.style.top = `${y - tooltip.offsetHeight / 2}px`;
          }}
        >
          <Image src="/icon-black.svg" alt="Logo" width={15} height={15} />
          {/* tooltip that follows the mouse */}
          {
            <div id="tooltip" data-visible={tooltipVisible} className="fixed left-0 top-0 z-50 text-black bg-[#97E771] ring-1 ring-black m-0.5 p-1 px-2.5 rounded-sm text-sm ">
              <p className="font-btr-normal">Play with BetterIDEa</p>
            </div>
          }
        </div>
      </Link>
    </div>
  );
}

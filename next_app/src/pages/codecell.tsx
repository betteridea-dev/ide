import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { runLua, spawnProcess, getResults, parseOutupt } from "@/lib/ao-vars";
import Image from "next/image";
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
import Arweave from "arweave";
import { LoaderIcon } from "lucide-react";
import runIcon from "@/assets/icons/run.svg"
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { v4 as uuidv4 } from "uuid"
import { cookies } from "next/headers";
import { ANSI } from "@/lib/utils";

type TActions = "codecell_load" | "codecell_run";
type TAnalyticsObj = {
    appname: string;
    action: TActions;
    messageId?: string;
}

var codeproxy = "";
export default function CodeCell() {
    const searchParams = useSearchParams();
    const [walletAddr, setWalletAddr] = useState<string>("");
    const [aosProcess, setAosProcess] = useState<string>("");
    // local storage flag to make sure if there are multiple iframes, only one of them spawns the process
    const [isSpawning, setIsSpawning] = useLocalStorage("isSpawning", undefined, { initializeWithValue: true });
    const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", undefined, { initializeWithValue: true });
    const [localAosProcess, setLocalAosProcess] = useLocalStorage("aosProcess", {}, { initializeWithValue: true });
    const [wallet, setWallet] = useState<any>(undefined);
    const [walletProxy, setWalletProxy] = useLocalStorage("wallet", undefined, { initializeWithValue: true });
    const [spawning, setSpawning] = useState<boolean>(false);
    const [running, setRunning] = useState<boolean>(false);
    const [code, setCode] = useState<string>('print("Hello AO!")');
    const [output, setOutput] = useState<string>("");
    const [appname, setAppname] = useState<string>("");
    const [mounted, setMounted] = useState(false);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const { theme } = useTheme();

    async function sendAnalytics(data: TAnalyticsObj) {
        const BASE = "https://api.betteridea.dev";
        // const BASE = "http://localhost:3001";
        const userId = localStorage.getItem('user-id') || "user-" + uuidv4();
        localStorage.setItem('user-id', userId);

        //this is in an iframe, get the parent websites domain and path
        const body = {
            ...data, userId,
            referrer: document.referrer,
        };

        await fetch(`${BASE}/analytics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });
        return body
    }

    useEffect(() => {
        sendAnalytics({
            action: "codecell_load",
            appname: appname,
        }).then(console.log)
    }, [appname]);

    useEffect(() => {
        console.log("wallet proxied");
        //debouncer
        const timeout = setTimeout(() => {
            if (searchParams.has("nowallet")) {
                // console.log("wallet debounced: ", walletProxy);
                setWallet(walletProxy);
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [walletProxy]);

    useEffect(() => {
        //anonymous async function
        (async () => {
            if (wallet) {
                const arweave = Arweave.init({
                    host: "arweave.net",
                    port: 443,
                    protocol: "https",
                });
                const addr = await arweave.wallets.jwkToAddress(JSON.parse(wallet));
                window.arweaveWallet = JSON.parse(wallet);
                setWalletAddr(addr);
            }
        })();
    }, [wallet]);

    useEffect(() => {
        if (walletAddr) {
            console.log("walletAddr: ", walletAddr);
            setAutoconnect(true);

            spawnProcessHandler();
        }
    }, [walletAddr]);

    useEffect(() => {
        if (localAosProcess[appname]) {
            console.log("got local aos process: ", appname, localAosProcess);
            // const processappname = localAosProcess.split(";")[0];
            // const processid = localAosProcess.split(";")[1];
            // if (processappname == appname) {
            setAosProcess(localAosProcess[appname]);
            setIsSpawning(false);
            if (window.parent) {
                window.parent.postMessage({ action: "set_process", process: localAosProcess[appname], appname: appname }, "*");
            }
            // }
            // setLocalAosProcess(undefined);
        }
    }, [localAosProcess, appname]);

    async function setWalletData() {
        if (searchParams.has("nowallet")) {
            console.log("no web wallet");
            if (!wallet && walletProxy) return setWallet(walletProxy);
            // generate a jwk and set localstorage to the jwk
            // set walletAddr to the address of the jwk
            // set autoconnect to true

            // check if a wallet already exists in localstorage
            // if not, generate a new one

            const w = walletProxy;
            const arweave = Arweave.init({
                host: "arweave.net",
                port: 443,
                protocol: "https",
            });
            let jwk;
            if (w) {
                jwk = JSON.parse(w);
            } else {
                jwk = await arweave.wallets.generate();
                // localStorage.setItem("wallet", JSON.stringify(jwk));
            }
            setWalletProxy(JSON.stringify(jwk));
            window.arweaveWallet = { ...jwk };
            // window.arweaveWallet = { ...jwk };

            // setWalletAddr(await arweave.wallets.jwkToAddress(jwk));
            // setAutoconnect(true);

            // add a listener to localstorage so when wallet is updated, it updates the walletAddr
            // window.addEventListener("storage", async (e) => {
            //   if (e.key === "wallet") {
            //     const jwk = JSON.parse(e.newValue);
            //     window.arweaveWallet = { ...jwk };
            //     setWalletAddr(await arweave.wallets.jwkToAddress(jwk));
            //   }
            // });
        } else {
            try {
                console.log("connecting with web wallet");
                await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
                const addr = await window.arweaveWallet.getActiveAddress();
                if (walletAddr == addr) spawnProcessHandler();
                else setWalletAddr(addr);
            } catch (e) {
                console.log(e);
            }
        }
    }

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
                setWalletData();
            }
        }
        run();
    }, [searchParams, autoconnect, mounted]);

    async function connectHandler() {
        if (!window) return;
        let wallet = window.arweaveWallet;
        if (!wallet && !searchParams.has("nowallet")) return toast("Please install the ArConnect extension");
        setWalletData();
    }

    //useEffect(() => {
    //  if (!aosProcess) return;
    //  //send aosProcess to parent
    //  if (window.parent) {
    //    window.parent.postMessage({ action: "set_process", process: aosProcess, appname: appname }, "*");
    //  }
    //}, [aosProcess, appname]);

    async function spawnProcessHandler() {
        console.log("handling spawn");
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
            // setSpawning(true);
            // const locisSpawning = localStorage.getItem("isSpawning");
            //   if (localStorage.getItem("localAosProcess").split(";")[0] === appname) {
            //     // check if the last aosProcess appname is same as this, if yes return else spawn
            //     console.log("Same appname, returning");
            //     return;
            //   }
            // if (locisSpawning === "true")
            // setIsSpawning(true);
            // console.log("No process found, creating one");
            // -----------------------------

            // const loc = window.location.origin + window.location.pathname;
            // console.log(loc)
            console.log("Creating process", prcName, appname, walletAddr);
            const r = await spawnProcess(`${prcName}`, [
                { name: "External-App-Name", value: appname },
                { name: "External-Url", value: `${btoa(url)}` },
                { name: "File-Type", value: "External-Code-Cell" },
            ]);
            if (r) {
                setAosProcess(r);
                // setLocalAosProcess(`${r}`);
                setLocalAosProcess((prev) => {
                    return { ...prev, [appname]: r };
                });
                setSpawning(false);
                console.log("Process created", r);
            }
        } else {
            console.log("Found existing process using", ids[0].value);
            setAosProcess(ids[0].value);
            // setLocalAosProcess(ids[0].value);
            setLocalAosProcess((prev) => {
                return { ...prev, [appname]: ids[0].value };
            });
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
        const localProcesses = JSON.parse(localStorage.getItem("aosProcess") || "{}");
        if (!localProcesses[appname]) {
            console.log("No process found");
            return
        }
        setAosProcess(localProcesses[appname]);
        const r = await runLua(code_, localProcesses[appname], [
            { name: "External-App-Name", value: appname },
            { name: "External-Url", value: `${btoa(url)}` },
            { name: "File-Type", value: "External-Code-Cell" },
        ]);
        const out = parseOutupt(r);
        if (r.Error) return toast.error(r.Error);
        sendAnalytics({ appname: appname, action: "codecell_run", messageId: (r as any).id }).then(console.log);
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
            <GoogleAnalytics gaId="G-DJTRS37CPQ" />
            <GoogleTagManager gtmId="GTM-TSKD74RX" />
            {aosProcess && (
                <>
                    <div suppressHydrationWarning className="flex w-full h-full relative justify-start rounded-t-md border-b border-border min-h-[69px] p-0 m-0">
                        <Button suppressHydrationWarning variant="ghost" className="p-5 block h-full rounded-l rounded-b-none rounded-r-none" onClick={runCellCode}>
                            {/* <Image suppressHydrationWarning src={running ? Icons.loadingSVG : Icons.runSVG} alt="Run" data-running={running} width={30} height={30} className="data-[running=true]:animate-spin bg-foreground/10  rounded-full p-1.5 block min-w-[30px]" /> */}
                            {
                                running ? <LoaderIcon size={20} className="p-1 w-7 h-7 animate-spin text-primary bg-foreground/5 rounded-full" /> : <Image suppressHydrationWarning src={runIcon} alt="Run" width={25} height={25} className="p-1.5 w-7 h-7 rounded-full bg-foreground/5" />
                            }
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
                                // editor.updateOptions({ fontFamily: "DM mono" });
                                editor.updateOptions({ fontFamily: "monospace" });
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
                                padding: { top: 5 },
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
                        {output == undefined && <span className="text-primary"></span>}
                        {<Ansi className="font-btr-code">{`${typeof output == "object" ? JSON.stringify(output, null, 2) : output || ANSI.GREEN + ANSI.BOLD + "🧃 This is a live codecell! Interact with it! 💡"}`}</Ansi>}
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
            <Link href="https://ide.betteridea.dev" target="_blank" className="fixed right-0 top-0 bottom-0 bg-[#97E771] overflow-visible">
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

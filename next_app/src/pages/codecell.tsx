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
import { toast } from "sonner"
import { useSearchParams } from "next/navigation";
import { GraphQLClient, gql } from "graphql-request";

export default function CodeCell() {
    const searchParams = useSearchParams();
    const [walletAddr, setWalletAddr] = useState<string>("");
    const [aosProcess, setAosProcess] = useState<string>("");
    const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", false, { initializeWithValue: true });
    const [spawning, setSpawning] = useState<boolean>(false);
    const [running, setRunning] = useState<boolean>(false);
    const [code, setCode] = useState<string>('print("Hello AO!")');
    const [output, setOutput] = useState<string>("");
    const [appname, setAppname] = useState<string>("");

    useEffect(() => {
        if (searchParams.size > 0) {
            if (searchParams.has("code")) {
                setCode(searchParams.get("code") as string)
                console.log("CODE:", searchParams.get("code"))
            } else {
                setCode('print("Hello AO!")')
            }
            if (searchParams.has("app-name")) {
                const appnameProxy = searchParams.get("app-name") as string
                if (appnameProxy.length > 0) {
                    setAppname(appnameProxy)
                    console.log("APP:", searchParams.get("app-name"))
                }
                else {
                    setAppname("Unnamed")
                }
            } else {
                setAppname("Unnamed")
                setCode('print("Hello AO!")')
            }

        }
        if (autoconnect) {
            connectHandler()
        }
    }, [searchParams, autoconnect])

    async function connectHandler() {
        if (!window) return
        const wallet = window.arweaveWallet;
        if (!wallet) return toast("Please install the ArConnect extension");

        await wallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
        const addr = await wallet.getActiveAddress();
        setWalletAddr(addr);
        setAutoconnect(true);
    }

    useEffect(() => {
        if (!walletAddr) return
        console.log(walletAddr)
        spawnProcessHandler()
    }, [walletAddr])

    async function spawnProcessHandler() {
        setSpawning(true);
        // const r = await spawnProcess();
        // setAosProcess(r);
        // setSpawning(false);
        const client = new GraphQLClient("https://arweave.net/graphql");

        const queryToFetchAlreadyCreatedProcess = gql`
    query {
  transactions(
    owners: "${walletAddr}"
    tags: [
      { name: "Data-Protocol", values: ["ao"] }
      { name: "Type", values: ["Process"] }
      { name: "Name", values: ["${appname}-Process-BetterIDEa-Code-Cell"] }
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
        console.log(ids)

        if (ids.length == 0) {
            console.log("No process found, creating one")
            const loc = window.location.origin + window.location.pathname;
            console.log(loc)
            const r = await spawnProcess(`${appname}-Process-BetterIDEa-Code-Cell`, [
                { name: "External-App-Name", value: appname },
                { name: "External-Url", value: `${btoa(loc)}` },
                { name: "File-Type", value: "External-Code-Cell" }
            ]);
            if (r) {
                setAosProcess(r);
                setSpawning(false);
                console.log("Process created", r)
            }
        } else {
            console.log("Found existing process using", ids[0].value)
            setAosProcess(ids[0].value);
            setSpawning(false);
        }
    }

    async function runCellCode() {
        const loc = window.location.origin + window.location.pathname;
        setRunning(true);
        console.log("running", code)
        const r = await runLua(code, aosProcess, [
            { name: "External-App-Name", value: appname },
            { name: "External-Url", value: `${btoa(loc)}` },
            { name: "File-Type", value: "External-Code-Cell" }
        ]);
        const out = parseOutupt(r);
        console.log(out)
        setOutput(out);
        setRunning(false);
    }

    useEffect(() => {
        const callback = async (e) => {
            // if (e.origin == "http://localhost:3000") return;
            // console.log(e);
            if (e.data.action == "run") {
                var url = (window.location != window.parent.location)
                    ? document.referrer
                    : document.location.href;
                console.log(url)
                console.log("running", code)
                setRunning(true);
                console.log("process:", aosProcess)
                const r = await runLua(code, aosProcess, [
                    { name: "External-App-Name", value: appname },
                    { name: "External-Url", value: btoa(url) },
                    { name: "File-Type", value: "External-Code-Cell" }
                ]);
                const out = parseOutupt(r);
                console.log(out)
                setOutput(out);
                setRunning(false);
            }
        };

        window.removeEventListener("message", callback);
        window.addEventListener("message", callback);
        return () => {
            window.removeEventListener("message", callback);
        };
    }, [aosProcess, code, appname])

    return <div suppressHydrationWarning
        className="relative h-screen w-screen flex flex-col justify-center items-center bg-btr-grey-3"
    >

        {aosProcess ? <><div suppressHydrationWarning className="flex w-full h-full relative justify-center rounded-t-md border-b border-btr-grey-2/70 min-h-[69px]">
            <Button
                variant="ghost"
                className="p-5 block h-full rounded-l rounded-b-none rounded-r-none min-w-[60px]"
                onClick={runCellCode}
            >
                <Image
                    src={running ? Icons.loadingSVG : Icons.runSVG}
                    alt="Run"
                    data-running={running}
                    width={30}
                    height={30}
                    className="data-[running=true]:animate-spin"
                />
            </Button>
            <Editor
                onMount={(editor, monaco) => {
                    monaco.editor.defineTheme(
                        "notebook",
                        notebookTheme as editor.IStandaloneThemeData
                    );
                    monaco.editor.setTheme("notebook");
                    // set font family
                    editor.updateOptions({ fontFamily: "DM mono" });
                }}
                onChange={(value) => {
                    // console.log(value);
                    // const newContent = { ...file.content };
                    // newContent.cells[cellId] = { ...cell, code: value };
                    // manager.updateFile(project, { file, content: newContent });
                    setCode(value)
                }}
                // height={
                // (code.split("\n").length > 10
                //     ? 10
                //     : code.split("\n").length) * 20
                // }
                width="94%"
                className="min-h-[68px] pt-1 font-btr-code"
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
                    scrollbar: { vertical: "hidden", horizontal: "hidden" },
                    renderLineHighlight: "none",
                }}
            />
        </div>
            <pre suppressHydrationWarning className="w-full text-sm font-btr-code max-h-[250px] min-h-[40px] overflow-scroll p-2 ml-20 rounded-b-md">
                {<Ansi useClasses className="font-btr-code">{`${typeof output == "object" ? JSON.stringify(output, null, 2) : output}`}</Ansi>}
            </pre></> : <>
            {walletAddr ? <Button onClick={spawnProcessHandler} disabled={spawning}>{spawning ? "Loading Process" : "Spawn Process"}</Button> : <Button onClick={connectHandler}>Connect</Button>}
        </>}
    </div>


}
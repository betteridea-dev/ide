import "@xterm/xterm/css/xterm.css"
import { useEffect, useState } from "react"
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { Readline } from "xterm-readline";
import { sendGAEvent } from "@next/third-parties/google";
import { getResults, runLua } from "@/lib/ao-vars";
import { useGlobalState } from "@/states";
import { useProjectManager } from "@/hooks";
import { toast } from "./ui/use-toast";
import { toast as sonnerToast } from "sonner"
import { useTheme } from "next-themes";
import { stripAnsiCodes } from "@/lib/utils";


let history: string[] = [];
let prompt = "aos> "
export default function Term() {
    const [termDiv, setTermDiv] = useState<HTMLDivElement | null>(null)
    const [loaded, setLoaded] = useState(false)
    const globalState = useGlobalState()
    const projectManager = useProjectManager()
    const project = projectManager.getProject(globalState.activeProject)
    const [running, setRunning] = useState(false)
    // const [prompt, setPrompt] = useState("aos> ")
    const [length, setLength] = useState(1)
    const { theme } = useTheme()
    const [term, setTerm] = useState(new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontSize: 14.5,
        fontFamily: "DM Mono",
        cursorWidth: 50,
        theme: {
            background: theme == "dark" ? "black" : "white",
            foreground: theme == "dark" ? "white" : "black",
            cursor: theme == "dark" ? "white" : "black",
            selectionBackground: theme == "dark" ? "white" : "black",
            selectionForeground: theme == "dark" ? "black" : "white",
            cursorAccent: theme == "dark" ? "white" : "black",
        },
        allowTransparency: true,
        cols: 150,
        rows: 20,
        lineHeight: 1,
    }))
    const [rl, setRl] = useState(new Readline())

    const maxRows = 50;
    const maxCols = 150


    useEffect(() => {
        const p = document.getElementById('ao-terminal')
        if (p) setTermDiv(p as HTMLDivElement)
    }, [])

    useEffect(() => {
        async function fetchNewInbox() {
            if (globalState.activeMode == "WARP") return;
            if (!project || !project.process) return;
            const ownerWallet = project.ownerWallet;
            const activeWallet = await window.arweaveWallet.getActiveAddress();
            if (ownerWallet != activeWallet) return;
            // console.log("ran");
            const cursor = sessionStorage.getItem("cursor") || "";
            const r = await getResults(project.process, cursor);
            if (r.cursor) sessionStorage.setItem("cursor", r.cursor);
            let fetchFlag = false;
            if (r.results.length > 0) {
                const messages = r.results;
                messages.forEach((msg: any) => {
                    const isPrint = msg.Output.print;
                    if (isPrint) {
                        const data = msg.Output.data;
                        console.log(data);
                        fetchFlag = true;
                        // toast({ variant: "newMessage", title: stripAnsiCodes(data) });
                        sonnerToast.custom((id) => <div className="bg-primary text-black p-2 px-4 border border-btr-black-1 rounded-md">{stripAnsiCodes(data)}</div>);
                        // setCommandOutputs([data, ...commandOutputs]);
                        rl.print("\r\x1b[K");
                        rl.println(data);
                        rl.print(prompt)
                        // term.writeln(data);
                        // term.write(prompt)
                        term.resize(maxCols, term.buffer.normal.length > maxRows ? maxRows : term.buffer.normal.length)
                        history.push(data);
                        console.log(history)

                    }
                });
                console.log(r.results);
                // fetchFlag && getInbox();
            }
        }

        sessionStorage.setItem("interval", setInterval(fetchNewInbox, 3000).toString());

        return () => {
            clearInterval(parseInt(sessionStorage.getItem("interval") || "0"));
        };
    }, [globalState.activeMode, project, project.process]);


    function readLine(newPrompt: string) {
        rl.read(newPrompt || prompt).then(processLine);
    }

    async function processLine(text: string) {
        // rl.println("you entered: " + text);


        if (!project)
            return toast({
                title: "Select a project to run code in",
            });
        if (!project.process)
            return toast({
                title: "No process for this project :(",
                description: "Please assign a process id from project settings before trying to run Lua code",
            });
        const ownerAddress = project.ownerWallet;
        const activeAddress = await window.arweaveWallet.getActiveAddress();
        const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
        if (ownerAddress != activeAddress) return toast({ title: "The owner wallet for this project is differnet", description: `It was created with ${shortAddress}.\nSome things might be broken` })

        term.resize(maxCols, term.buffer.normal.length > maxRows ? maxRows : term.buffer.normal.length)
        if (text.trim().length == 0) {
            return readLine(prompt);
        }
        console.log("running", text);
        setRunning(true);
        const result = await runLua(text, project.process, [
            { name: "File-Type", value: "Terminal" }
        ]);
        if (result.Error) {
            console.log(result.Error);
            rl.println(result.Error);
            history.push(result.Error);
        }
        if (result.Output) {
            console.log(result.Output);
            // setPrompt(result.Output.data.prompt);
            prompt = result.Output.data.prompt;
            console.log(result.Output.data.prompt)
            if (result.Output.data.json != "undefined") {
                // console.log(result.Output.data.json);
                // setCommandOutputs([JSON.stringify(result.Output.data.json, null, 2), ...commandOutputs]);
                console.log("json out")
                const outputStr = JSON.stringify(result.Output.data.json, null, 2);
                outputStr.split("\n").forEach((line) => {
                    rl.println(line);
                    history.push(line);
                    term.resize(maxCols, term.buffer.normal.length > maxRows ? maxRows : term.buffer.normal.length)
                })
                // rl.println(JSON.stringify(result.Output.data.json, null, 2));
            } else {
                // console.log(result.Output.data.output);
                // setCommandOutputs([result.Output.data.output, ...commandOutputs]);
                // rl.println(result.Output.data.output);
                console.log("normal out")
                const outputStr = `${result.Output.data.output}`;
                outputStr.split("\n").forEach((line) => {
                    rl.println(line);
                    history.push(line);
                    term.resize(maxCols, term.buffer.normal.length > maxRows ? maxRows : term.buffer.normal.length + 1)
                });
            }
            setLength(term.buffer.normal.length)
        }
        setRunning(false);
        sendGAEvent({ event: 'run_code', value: 'terminal' })

        setTimeout(() => readLine(result?.Output?.data?.prompt || prompt), 100);
    }


    useEffect(() => {
        if (loaded) return;
        if (!termDiv) return;


        term.loadAddon(rl);
        // term.loadAddon(fit);
        term.open(termDiv);
        // console.log(history)
        history.forEach((line) => {
            console.log("history", line)
            rl.appendHistory(line)
            term.resize(maxCols, term.buffer.normal.length > maxRows ? maxRows : term.buffer.normal.length)
        })
        // fit.fit();

        rl.setCheckHandler((text) => {
            let trimmedText = text.trimEnd();
            if (trimmedText.endsWith("&&")) {
                return false;
            }
            return true;
        });

        readLine(prompt)

        setLoaded(true)
    }, [termDiv])



    return <div id="ao-terminal" className=" w-full bg-transparent p-1 view-line font-btr-code"></div>
}
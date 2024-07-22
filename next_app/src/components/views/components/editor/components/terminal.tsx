import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Terminal } from "@xterm/xterm";
// import { FitAddon } from "@xterm/addon-fit";
import { Readline } from "xterm-readline";
import { sendGAEvent } from "@next/third-parties/google";
import { getResults, monitor, runLua, unmonitor } from "@/lib/ao-vars";
import { useGlobalState, useProjectManager } from "@/hooks";
import { toast } from "sonner"
import { useTheme } from "next-themes";
import { stripAnsiCodes } from "@/lib/utils";
import { connect } from "@permaweb/aoconnect";


// let promptBuf = ""
export default function AOTerminal({ prompt, setPrompt, commandOutputs, setCommandOutputs }: {
    prompt: string, setPrompt: Dispatch<SetStateAction<string>>,
    commandOutputs: string[], setCommandOutputs: Dispatch<SetStateAction<string[]>>
}) {
    // promptBuf = prompt
    const ao = connect()
    const [termDiv, setTermDiv] = useState<HTMLDivElement | null>(null)
    const [loaded, setLoaded] = useState(false)
    const globalState = useGlobalState()
    const projectManager = useProjectManager()
    const [running, setRunning] = useState(false)
    const project = projectManager.getProject(globalState.activeProject)
    const { theme } = useTheme()
    const [term, setTerm] = useState(new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontSize: 14,
        fontFamily: "DM Mono",
        cursorWidth: 25,
        theme: {
            background: theme == "dark" ? "black" : "white",
            foreground: theme == "dark" ? "white" : "black",
            cursor: theme == "dark" ? "white" : "black",
            selectionBackground: theme == "dark" ? "white" : "black",
            selectionForeground: theme == "dark" ? "black" : "white",
            cursorAccent: theme == "dark" ? "white" : "black",
        },
        allowTransparency: false,
        cols: 100,
        rows: 10,
        lineHeight: 1,
    }))
    const [rl, setRl] = useState(new Readline())

    const maxRows = 100;
    const maxCols = 100;
    const maxHistory = 30;

    function scrollToBottom() {
        term.scrollToBottom()
        const aoTerm = document.getElementById('ao-terminal')
        if (aoTerm) aoTerm.scrollTop = aoTerm.scrollHeight
        const termContainer = document.getElementById("terminal-container");
        if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;

    }

    useEffect(() => {
        if (!loaded) return;
        term.focus()
        term.clear()
        rl.println("\r\x1b[K");
        commandOutputs.forEach((line) => {
            rl.println(line);
            term.resize(maxCols, term.buffer.normal.length >= maxRows ? maxRows : term.buffer.normal.length)
        })
        console.log("prompt", globalState.prompt)
        globalState.prompt && rl.print(globalState.prompt)
        scrollToBottom()
    }, [loaded, globalState.activeProject, globalState.prompt, term, rl, commandOutputs])


    useEffect(() => {
        const p = document.getElementById('ao-terminal')
        if (p) setTermDiv(p as HTMLDivElement)
    }, [])

    useEffect(() => {
        if (loaded) return;
        if (!termDiv) return;


        term.loadAddon(rl);
        // term.loadAddon(fit);
        term.open(termDiv);
        // console.log(history)
        // history.forEach((line) => {
        //     console.log("history", line)
        //     rl.appendHistory(line)
        //     term.resize(maxCols, term.buffer.normal.length > maxRows ? maxRows : term.buffer.normal.length)
        // })
        // fit.fit();

        rl.setCheckHandler((text) => {
            let trimmedText = text.trimEnd();
            if (trimmedText.endsWith("&&")) {
                return false;
            }
            return true;
        });

        readLine(globalState.prompt)

        setLoaded(true)
        scrollToBottom()
    }, [globalState.prompt, loaded, readLine, rl, term, termDiv])

    useEffect(() => {
        if (!termDiv) return;
        if (!loaded) return;
        term.clear()
        rl.println("\r\x1b[K");
        commandOutputs.forEach((line) => {
            rl.println(line);
            term.resize(maxCols, term.buffer.normal.length > maxRows ? maxRows : term.buffer.normal.length)
        })
        globalState.prompt && rl.print(globalState.prompt)
        scrollToBottom()
    }, [commandOutputs, globalState.prompt, loaded, rl, term, termDiv])

    function readLine(newPrompt: string) {
        rl.read(newPrompt || prompt).then(processLine);
    }

    async function processLine(text: string) {
        // rl.println("you entered: " + text);

        if (!project)
            // return toast({
            //     title: "Select a project to run code in",
            // });
            return toast.error("Select a project to run code in", { id: "error" })
        if (!project.process)
            // return toast({
            //     title: "No process for this project :(",
            //     description: "Please assign a process id from project settings before trying to run Lua code",
            // });
            return toast.error("No process for this project :(", { description: "Please assign a process id from project settings before trying to run Lua code", id: "error" })
        const ownerAddress = project.ownerWallet;
        const activeAddress = await window.arweaveWallet.getActiveAddress();
        const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
        // if (ownerAddress != activeAddress) return toast({ title: "The owner wallet for this project is differnet", description: `It was created with ${shortAddress}.\nSome things might be broken` })
        if (ownerAddress != activeAddress) return toast.error("The owner wallet for this project is differnet", { description: `It was created with ${shortAddress}.\nSome things might be broken`, id: "error" })

        term.resize(maxCols, term.buffer.normal.length > maxRows ? maxRows : term.buffer.normal.length)
        if (text.trim().length == 0) {
            setCommandOutputs(p => {
                if (p.length >= maxHistory) p.shift()
                return [...p, ">"]
            });
            return readLine(globalState.prompt);
        }

        switch (text) {
            case "clear":
                setCommandOutputs([]);
                term.resize(maxCols, 10)
                return readLine(globalState.prompt);
            case ".monitor":
                rl.println(`\r\x1b[K\x1b[34mMonitoring Process... \x1b[0m`);
                try {
                    const res = await monitor(project.process);
                    // rl.println(`\r\x1b[K\x1b[34mMonitored: ${res}\x1b[0m`);
                    setCommandOutputs(p => {
                        if (p.length >= maxHistory) p.shift()
                        return [...p, `> ${text}`, `Monitored: \x1b[34m${res}\x1b[0m`]
                    })
                } catch (e) {
                    rl.println(`\r\x1b[K\x1b[31mError: ${e.message}\x1b[0m`);
                } finally {
                    return readLine(globalState.prompt);
                }
            case ".unmonitor":
                rl.println(`\r\x1b[K\x1b[34mUnmonitoring Process... \x1b[0m`);
                try {
                    const res = await unmonitor(project.process);
                    rl.println(`\r\x1b[KUnmonitored: \x1b[34m${res}\x1b[0m`);
                } catch (e) {
                    rl.println(`\r\x1b[K\x1b[31mError: ${e.message}\x1b[0m`);
                } finally {
                    return readLine(globalState.prompt);
                }
            default:
                console.log("running", text);
                setRunning(true);
                // print a line that says computing
                rl.println(`\r\x1b[K\x1b[34mComputing State Transformations... \x1b[0m`);
                const result = await runLua(text, project.process, [
                    { name: "File-Type", value: "Terminal" }
                ]);
                if (result.Error) {
                    console.log(result.Error);

                    setCommandOutputs(p => {
                        if (p.length >= maxHistory) p.shift()
                        return [...p, `\x1b[31m> ${text} \x1b[0m`, result.Error]
                    });
                    // rl.println(result.Error);
                }
                if (result.Output) {
                    console.log(result.Output);
                    // setPrompt(result.Output.data.prompt)
                    globalState.setPrompt(result.Output.prompt || result.Output.data.prompt)
                    console.log(result.Output.prompt || result.Output.data.prompt)
                    if (result.Output.data.json != "undefined") {
                        console.log("json", result.Output.data.json);
                        const outputStr = JSON.stringify(result.Output.data.json, null, 2);
                        setCommandOutputs(p => {
                            if (p.length >= maxHistory) p.shift()
                            return [...p, `> ${text}`, outputStr]
                        });
                    } else {
                        console.log("normal", result.Output.data.output);
                        setCommandOutputs(p => {
                            if (p.length >= maxHistory) p.shift()
                            return [...p, `> ${text}`, result.Output.data.output]
                        });
                    }
                }
                setRunning(false);
                sendGAEvent({ event: 'run_code', value: 'terminal' })
                scrollToBottom()
                setTimeout(() => readLine(result?.Output?.data?.prompt || prompt), 100);
                break;
        }
    }

    if (!globalState.activeProject) {
        return <div className="w-full h-full flex items-center justify-center text-lg font-btr-code">No active project</div>
    }

    return <div id="ao-terminal" className="flex flex-col-reverse w-full bg-transparent p-1 view-line font-btr-code"></div>
}
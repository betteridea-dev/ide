import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Terminal } from "@xterm/xterm";
// import { FitAddon } from "@xterm/addon-fit";
import { Readline } from "xterm-readline";
import { sendGAEvent } from "@next/third-parties/google";
import { getResults, monitor, runLua, unmonitor } from "@/lib/ao-vars";
import { useGlobalState, useProjectManager } from "@/hooks";
import { toast } from "sonner"
import { useTheme } from "next-themes";
import { ANSI, stripAnsiCodes } from "@/lib/utils";
import { connect } from "@permaweb/aoconnect";
import { useLocalStorage } from "usehooks-ts";
import { TProjectStorage } from "@/hooks/useProjectManager";

const helpText = `Available Commands:

    ${ANSI.LIGHTGREEN}help${ANSI.RESET}                          Print this help screen
    ${ANSI.LIGHTGREEN}clear${ANSI.RESET}                         Clear the terminal screen
    ${ANSI.LIGHTGREEN}ls${ANSI.RESET}                            List files in the current project

    ${ANSI.LIGHTGREEN}.list-process${ANSI.RESET}                 List all processes in the current project
    ${ANSI.LIGHTGREEN}.set-default [process_id]${ANSI.RESET}     Change the default process for this project
    ${ANSI.LIGHTGREEN}.load [file]${ANSI.RESET}                  Loads local Lua file into the process
    ${ANSI.LIGHTGREEN}.load-blueprint [name]${ANSI.RESET}        Loads a blueprint into the process
    ${ANSI.LIGHTGREEN}.monitor${ANSI.RESET}                      Starts monitoring cron messages for this process
    ${ANSI.LIGHTGREEN}.unmonitor${ANSI.RESET}                    Stops monitoring cron messages for this process
`

let promptBuf = ""
export default function AOTerminal({ commandOutputs, setCommandOutputs }: {
    commandOutputs: string[], setCommandOutputs: Dispatch<SetStateAction<string[]>>
}) {
    // promptBuf = prompt
    // const [projects, _] = useLocalStorage<TProjectStorage>("projects", {}, { initializeWithValue: true })
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
        rows: 100,
        lineHeight: 1,
    }))
    const [rl, setRl] = useState(new Readline())

    const maxRows = 100;
    const maxCols = 100;
    const maxHistory = 100;

    function scrollToBottom() {
        term.scrollToBottom()
        const aoTerm = document.getElementById('ao-terminal')
        if (aoTerm) aoTerm.scrollTop = aoTerm.scrollHeight
        const termContainer = document.getElementById("terminal-container");
        if (termContainer) termContainer.scrollTop = termContainer.scrollHeight;
    }

    useEffect(() => {
        if (!globalState.prompt)
            runLua("return Prompt()", project.process).then((res) => {
                if (res.Error) return toast.error(res.Error)
                globalState.setPrompt(res.Output.prompt || res.Output.data.prompt)
                promptBuf = res.Output.prompt || res.Output.data.prompt
            })
        else
            promptBuf = globalState.prompt
    }, [globalState.prompt, project.process])

    useEffect(() => {
        if (!termDiv) return;
        if (!loaded) return;
        term.focus()
        term.clear()
        rl.println("\r\x1b[K");
        commandOutputs.forEach((line) => {
            rl.println(line);
            term.resize(maxCols, term.buffer.normal.length >= maxRows ? maxRows : term.buffer.normal.length)
        })
        console.log("prompt", globalState.prompt)
        rl.print(promptBuf)
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



        setLoaded(true)
        scrollToBottom()
    }, [globalState, globalState.prompt, loaded, project, projectManager, project.files, rl, setCommandOutputs, term, termDiv])

    useEffect(() => {
        setCommandOutputs(Array.from({ length: 100 }, () => ""));
        term.resize(maxCols, 100)
    }, [])


    function readLine(newPrompt: string) {


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
                return readLine(promptBuf);
            }
            const command = text.trim().split(" ");
            switch (text.trim().split(" ")[0]) {
                case "clear":
                case ".clear":
                    setCommandOutputs(Array.from({ length: 100 }, () => ""));
                    term.resize(maxCols, 100)
                    break;
                case ".help":
                case "help":
                    setCommandOutputs(p => {
                        if (p.length >= maxHistory) p.shift()
                        return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.RESET}`, helpText]
                    });
                    break;
                case ".list-process":
                    let processes = [];
                    for (const f in project.files) {
                        const file = project.files[f];
                        if (file.process)
                            processes.push({ file: file.name, process: file.process })
                    }
                    let outString = "Processes:\n";
                    outString += "Default\t\t" + ANSI.LIGHTGREEN + project.process + ANSI.RESET + "\n\n"

                    const table = processes.map((p) => {
                        return [p.file, p.process]
                    })

                    const maxColWidth = table.reduce((acc, val) => {
                        return val[0].length > acc ? val[0].length : acc
                    }, 0)

                    const tableString = table.map((row) => {
                        return `${ANSI.BLUE}${row[0]}`.padEnd(maxColWidth) + "\t" + `${ANSI.LIGHTGREEN}${row[1]}${ANSI.RESET}`
                    }).join("\n")

                    outString += tableString
                    setCommandOutputs(p => {
                        if (p.length >= maxHistory) p.shift()
                        return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.RESET}`, outString]
                    });

                    break;
                case ".set-default":
                    if (command.length < 2) {
                        setCommandOutputs(p => {
                            if (p.length >= maxHistory) p.shift()
                            return [...p, `${ANSI.LIGHTRED}> ${text}`, `Please specify a process id${ANSI.RESET}`]
                        });
                        break;
                    }
                    const processId = command[1];
                    rl.println("TODO")

                    break;
                case ".load-blueprint":
                    if (command.length < 2) {
                        setCommandOutputs(p => {
                            if (p.length >= maxHistory) p.shift()
                            return [...p, `${ANSI.LIGHTRED}> ${text}`, `Please specify a blueprint name${ANSI.RESET}`]
                        });
                        break;
                    }
                    const blueprintName = command[1];
                    rl.println("TODO")

                    break;
                case "ls":
                    const project_ = projectManager.projects[globalState.activeProject]
                    // const project_ = projects[globalState.activeProject];

                    const files = Object.keys(project_.files).map((f) => project_.files[f].name);
                    setCommandOutputs(p => {
                        if (p.length >= maxHistory) p.shift()
                        return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.LIGHTBLUE}`, files.join("\n") + ANSI.RESET]
                    });
                    break;
                case ".load":
                    if (command.length > 1) {
                        const filename = command[1];
                        if (!filename.endsWith(".lua")) {
                            setCommandOutputs(p => {
                                if (p.length >= maxHistory) p.shift()
                                return [...p, `${ANSI.LIGHTRED}> ${text}`, `Only .lua files can be loaded${ANSI.RESET}`]
                            });
                            break;
                        }
                        else {
                            const project_ = projectManager.getProject(globalState.activeProject);
                            // const project_ = projects[globalState.activeProject];
                            const file = Object.keys(project_.files).find((f) => project_.files[f].name == filename);
                            if (!file) {
                                setCommandOutputs(p => {
                                    if (p.length >= maxHistory) p.shift()
                                    return [...p, `${ANSI.LIGHTRED}> ${text}`, `File ${filename} not found${ANSI.RESET}`]
                                });
                                break;
                            }
                            console.log("file", project_.files[file]);
                            const src = project_.files[file].content.cells[0].code;
                            console.log("src", src);

                            setRunning(true);
                            // print a line that says computing
                            rl.println(`${ANSI.CLEARLINE}${ANSI.LIGHTYELLOW}Loading ${filename}...${ANSI.RESET}`);
                            const result = await runLua(src, project_.process, [
                                { name: "File-Type", value: "Terminal" }
                            ]);

                            if (result.Error) {
                                console.log(result.Error);
                                setCommandOutputs(p => {
                                    if (p.length >= maxHistory) p.shift()
                                    return [...p, `${ANSI.LIGHTRED}> ${text}`, result.Error, ANSI.RESET]
                                });
                            }

                            if (result.Output) {
                                console.log(result.Output);
                                result.Output.prompt && globalState.setPrompt(result.Output.prompt)
                                result.Output.data.prompt && globalState.setPrompt(result.Output.data.prompt)

                                console.log(result.Output.prompt || result.Output.data.prompt)
                                const outputData = result.Output.data;
                                console.log("outputData", outputData);
                                if (typeof outputData == "string" || typeof outputData == "number") {
                                    console.log(outputData);
                                    setCommandOutputs(p => {
                                        if (p.length >= maxHistory) p.shift()
                                        return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.RESET}`, outputData.toString()]
                                    });
                                } else
                                    if (result.Output.data.json != "undefined") {
                                        console.log("json", result.Output.data.json);
                                        const outputStr = JSON.stringify(result.Output.data.json, null, 2);
                                        setCommandOutputs(p => {
                                            if (p.length >= maxHistory) p.shift()
                                            return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.RESET}`, outputStr]
                                        });
                                    } else {
                                        console.log("normal", result.Output.data.output);
                                        setCommandOutputs(p => {
                                            if (p.length >= maxHistory) p.shift()
                                            return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.RESET}`, result.Output.data.output]
                                        });
                                    }
                            }
                            setRunning(false);
                            sendGAEvent({ event: 'run_code', value: 'terminal' })
                        }
                        scrollToBottom()
                    } else {
                        setCommandOutputs(p => {
                            if (p.length >= maxHistory) p.shift()
                            return [...p, `${ANSI.LIGHTRED}> ${text}`, `Please specify a file to load${ANSI.RESET}`]
                        });
                    }
                    break;
                case ".monitor":
                    rl.println(`${ANSI.CLEARLINE}${ANSI.LIGHTBLUE}Monitoring Process...${ANSI.RESET}`);
                    try {
                        const res = await monitor(project.process);
                        // rl.println(`\r\x1b[K\x1b[34mMonitored: ${res}\x1b[0m`);
                        setCommandOutputs(p => {
                            if (p.length >= maxHistory) p.shift()
                            return [...p, `Monitored: ${ANSI.LIGHTGREEN}${res}${ANSI.RESET}`]
                        })
                    } catch (e) {
                        rl.println(`${ANSI.CLEARLINE}${ANSI.LIGHTRED}Error: ${e.message}${ANSI.RESET}`);
                    }
                    break;
                case ".unmonitor":
                    rl.println(`${ANSI.CLEARLINE}${ANSI.LIGHTBLUE}Unmonitoring Process...${ANSI.RESET}`);
                    try {
                        const res = await unmonitor(project.process);
                        // rl.println(`\r\x1b[KUnmonitored: \x1b[34m${res}\x1b[0m`);
                        setCommandOutputs(p => {
                            if (p.length >= maxHistory) p.shift()
                            return [...p, `Unmonitored:  ${ANSI.LIGHTGREEN}${res}${ANSI.RESET}`]
                        })
                    } catch (e) {
                        rl.println(`${ANSI.CLEARLINE}${ANSI.LIGHTRED}Error: ${e.message}${ANSI.RESET}`);
                    }
                    break;
                default:
                    console.log("running", text);
                    setRunning(true);
                    // print a line that says computing
                    rl.println(`${ANSI.CLEARLINE}${ANSI.LIGHTBLUE}Computing State Transformations... ${ANSI.RESET}`);
                    const result = await runLua(text, project.process, [
                        { name: "File-Type", value: "Terminal" }
                    ]);
                    globalState.appendHistory(project.name, { id: (result as any).id!, code: text, timestamp: Date.now(), output: result.Output.data });
                    if (result.Error) {
                        console.log(result.Error);

                        setCommandOutputs(p => {
                            if (p.length >= maxHistory) p.shift()
                            return [...p, `${ANSI.LIGHTRED}> ${text}`, result.Error + ANSI.RESET]
                        });
                        // rl.println(result.Error);
                    }
                    if (result.Output) {
                        console.log(result.Output);
                        // setPrompt(result.Output.data.prompt)
                        result.Output.prompt && globalState.setPrompt(result.Output.prompt)
                        result.Output.data.prompt && globalState.setPrompt(result.Output.data.prompt)

                        console.log(result.Output.prompt || result.Output.data.prompt)
                        const outputData = result.Output.data;
                        console.log("outputData", outputData);
                        if (typeof outputData == "string" || typeof outputData == "number") {
                            console.log(outputData);
                            // fileContent.cells[cellId].output = outputData;
                            // globalState.setLastOutput(outputData as string);
                            setCommandOutputs(p => {
                                if (p.length >= maxHistory) p.shift()
                                return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.RESET}`, outputData.toString()]
                            });
                        } else
                            if (result.Output.data.json != "undefined") {
                                console.log("json", result.Output.data.json);
                                const outputStr = JSON.stringify(result.Output.data.json, null, 2);
                                setCommandOutputs(p => {
                                    if (p.length >= maxHistory) p.shift()
                                    return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.RESET}`, outputStr]
                                });
                            } else {
                                console.log("normal", result.Output.data.output);
                                setCommandOutputs(p => {
                                    if (p.length >= maxHistory) p.shift()
                                    return [...p, `${ANSI.LIGHTGREEN}> ${text}${ANSI.RESET}`, result.Output.data.output]
                                });
                            }
                    }
                    setRunning(false);
                    sendGAEvent({ event: 'run_code', value: 'terminal' })
                    scrollToBottom()
                    break;
            }
            setTimeout(() => readLine(promptBuf), 100);
        }

        rl.read(newPrompt).then(processLine);
    }

    readLine(promptBuf)

    if (!globalState.activeProject) {
        return <div className="w-full h-full flex items-center justify-center text-lg font-btr-code">No active project</div>
    }

    return <div id="ao-terminal" className="flex flex-col-reverse w-full bg-white dark:bg-black p-1 view-line font-btr-code"></div>
}
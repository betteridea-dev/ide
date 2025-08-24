import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { useTheme } from './theme-provider'
import { ANSI, cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { useProjects } from '@/hooks/use-projects'
import { useGlobalState } from '@/hooks/use-global-state'
import { useTerminalState, type TerminalHistoryEntry } from '@/hooks/use-terminal-state'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Readline } from 'xterm-readline'
import '@xterm/xterm/css/xterm.css'
import { MainnetAO } from '@/lib/ao'
import { createSigner } from '@permaweb/aoconnect'
import { useApi } from '@arweave-wallet-kit/react'

const AOS_ASCII = String.raw`
      ___           ___           ___     
     /\  \         /\  \         /\  \    
    /::\  \       /::\  \       /::\  \   
   /:/\:\  \     /:/\:\  \     /:/\ \  \  
  /::\~\:\  \   /:/  \:\  \   _\:\~\ \  \ 
 /:/\:\ \:\__\ /:/__/ \:\__\ /\ \:\ \ \__\
 \/__\:\/:/  / \:\  \ /:/  / \:\ \:\ \/__/
      \::/  /   \:\  /:/  /   \:\ \:\__\  
      /:/  /     \:\/:/  /     \:\/:/  /  
     /:/  /       \::/  /       \::/  /   
     \/__/         \/__/         \/__/    
`

export default function Terminal() {
    const settings = useSettings()
    const activeProjectId = useGlobalState(s => s.activeProject)
    const project = useProjects(s => s.projects[activeProjectId])
    const process = project?.process
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const readlineRef = useRef<Readline | null>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [prompt, setPrompt] = useState("> ")

    // Terminal state management
    const { addTerminalEntry, setTerminalPrompt, clearTerminalHistory, getTerminalState } = useTerminalState(s => s.actions)
    const terminalState = process ? getTerminalState(process) : { history: [], prompt: "> " }

    // Spinner state
    const spinnerIntervalRef = useRef<NodeJS.Timeout | null>(null)
    // const spinnerChars = ['▖', '▘', '▝', '▗']
    // const spinnerChars = "⢎⡰,⢎⡡,⢎⡑,⢎⠱,⠎⡱,⢊⡱,⢌⡱,⢆⡱".split(",")
    const spinnerChars = "⣷⣯⣟⡿⢿⣻⣽⣾".split("")
    // const spinnerChars = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏".split("")
    const spinnerIndexRef = useRef(0)

    // Spinner functions
    const startSpinner = useCallback(() => {
        if (spinnerIntervalRef.current) {
            clearInterval(spinnerIntervalRef.current)
        }
        spinnerIntervalRef.current = setInterval(() => {
            if (xtermRef.current) {
                const spinnerChar = spinnerChars[spinnerIndexRef.current++ % spinnerChars.length]
                xtermRef.current.write(ANSI.RESET + ANSI.LIGHTBLUE + "\r" + spinnerChar + " computing... " + ANSI.RESET)
            }
        }, 100)
    }, [])

    const stopSpinner = useCallback(() => {
        if (spinnerIntervalRef.current) {
            clearInterval(spinnerIntervalRef.current)
            spinnerIntervalRef.current = null
        }
        if (xtermRef.current) {
            xtermRef.current.write('\r' + ' '.repeat(15) + '\r') // Clear the spinner area (computing [x] is ~13 chars)
        }
    }, [])

    const { theme } = useTheme()
    const api = useApi()
    const ao = new MainnetAO({
        HB_URL: settings.HB_URL,
        GATEWAY_URL: settings.GATEWAY_URL,
        signer: createSigner(api)
    })

    // Function to show initial terminal state (ASCII art + connection message)
    const showInitialTerminalState = useCallback(() => {
        if (!xtermRef.current || !process) return

        // Clear terminal first
        xtermRef.current.clear()

        // Show ASCII art
        const asciiLines = AOS_ASCII.split('\n')
        asciiLines.forEach((line, index) => {
            if (index === 0 && line.trim() === '') return // Skip first empty line
            xtermRef.current!.write(ANSI.RESET + ANSI.LIGHTBLUE + line + ANSI.RESET)
            if (index < asciiLines.length - 1) {
                xtermRef.current!.write('\r\n') // Add proper carriage return + line feed
            }
        })
        xtermRef.current.write("\n" + ANSI.RESET + ANSI.DIM + "Connected to process: " + ANSI.RESET + ANSI.LIGHTBLUE + process + ANSI.RESET)
        xtermRef.current.write('\n\r\n')
    }, [process])

    // Function to restore terminal history
    const restoreTerminalHistory = useCallback(() => {
        if (!xtermRef.current || !process) return

        const state = getTerminalState(process)

        // Show initial state first
        showInitialTerminalState()

        // Restore history
        state.history.forEach(entry => {
            switch (entry.type) {
                case 'input':
                    xtermRef.current!.write(ANSI.RESET + state.prompt + entry.content + '\r\n')
                    break
                case 'output':
                    xtermRef.current!.write(ANSI.RESET + entry.content + '\r\n')
                    break
                case 'error':
                    xtermRef.current!.write(ANSI.RESET + ANSI.RED + entry.content + ANSI.RESET + '\r\n')
                    break
                case 'system':
                    xtermRef.current!.write(ANSI.RESET + ANSI.DIM + entry.content + ANSI.RESET + '\r\n')
                    break
            }
        })

        // Set the current prompt
        setPrompt(state.prompt)

        // Show the current prompt in the terminal so user knows where to type
        if (state.history.length > 0) {
            xtermRef.current!.write(ANSI.RESET + state.prompt)
        }
    }, [process, getTerminalState, showInitialTerminalState])

    // Function to clear terminal to initial state
    const clearTerminalToInitialState = useCallback(() => {
        if (!process || !xtermRef.current) return

        // Clear the stored history
        clearTerminalHistory(process)

        // Show initial state
        showInitialTerminalState()

        // Show the prompt in the terminal so user knows where to type
        xtermRef.current.write(ANSI.RESET + prompt)
    }, [process, prompt, clearTerminalHistory, showInitialTerminalState])


    useEffect(() => {
        if (!process) return

        // First check if we have a stored prompt, otherwise fetch from server
        const storedState = getTerminalState(process)
        if (storedState.prompt && storedState.prompt !== "> ") {
            setPrompt(storedState.prompt)
        } else {
            const hashpath = `${settings.HB_URL}/${process}/now/results/output/prompt/~json@1.0/serialize`
            fetch(hashpath).then(res => res.json()).then(data => {
                const newPrompt = data.body || "> "
                setPrompt(newPrompt)
                setTerminalPrompt(process, newPrompt)
            }).catch(() => {
                setPrompt("> ")
                setTerminalPrompt(process, "> ")
            })
        }
    }, [process, theme, getTerminalState, setTerminalPrompt])

    // Get theme configuration
    const getThemeConfig = (currentTheme: string) => {
        return {
            background: currentTheme === "dark" ? "black" : "white",
            foreground: currentTheme === "dark" ? "white" : "black",
            cursor: currentTheme === "dark" ? "white" : "black",
            selectionBackground: currentTheme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
            selectionForeground: currentTheme === "dark" ? "black" : "white",
            cursorAccent: currentTheme === "dark" ? "white" : "black",
        }
    }

    // Initialize terminal
    useEffect(() => {
        if (!terminalRef.current) return

        // Initialize terminal
        const xterm = new XTerm({
            smoothScrollDuration: 0,
            cursorBlink: true,
            cursorStyle: "bar",
            fontSize: 14,
            fontFamily: '"DM Mono", monospace',
            cursorWidth: 25,
            theme: getThemeConfig(theme),
            allowTransparency: false,
            cols: 80,
            rows: 30,
            lineHeight: 1,
            letterSpacing: 0,
            fontWeight: 'normal',
            fontWeightBold: 'bold',
        })

        // Initialize addons
        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()
        const readline = new Readline()

        // Load addons
        xterm.loadAddon(fitAddon)
        xterm.loadAddon(webLinksAddon)
        xterm.loadAddon(readline)

        // Add keyboard handler for Ctrl+L
        xterm.onKey(({ key, domEvent }) => {
            if (domEvent.ctrlKey && domEvent.key === 'l') {
                domEvent.preventDefault()
                clearTerminalToInitialState()
            }
        })

        // Open terminal
        xterm.open(terminalRef.current)

        // Store references
        xtermRef.current = xterm
        fitAddonRef.current = fitAddon
        readlineRef.current = readline

        // Fit terminal to container
        fitAddon.fit()

        setIsReady(true)

        // Restore terminal history after terminal is ready
        setTimeout(() => {
            restoreTerminalHistory()
        }, 100)

        // Cleanup
        return () => {
            // Clean up spinner
            if (spinnerIntervalRef.current) {
                clearInterval(spinnerIntervalRef.current)
                spinnerIntervalRef.current = null
            }

            xterm.dispose()
            xtermRef.current = null
            fitAddonRef.current = null
            readlineRef.current = null
            setIsReady(false)
        }
    }, [theme, restoreTerminalHistory, clearTerminalToInitialState])



    // Fit terminal to container with debouncing
    const fitTerminal = useCallback(() => {
        if (fitAddonRef.current && xtermRef.current && isReady) {
            try {
                fitAddonRef.current.fit()
            } catch (error) {
                console.warn('Terminal fit error:', error)
            }
        }
    }, [isReady])

    // Update theme when it changes
    useEffect(() => {
        if (xtermRef.current) {
            xtermRef.current.options.theme = getThemeConfig(theme)
        }
    }, [theme])

    // Handle dynamic resizing with ResizeObserver and window resize
    useEffect(() => {
        if (!terminalRef.current || !isReady) return

        let resizeTimeout: NodeJS.Timeout

        const debouncedFit = () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(fitTerminal, 50)
        }

        // Use ResizeObserver for container size changes
        if (window.ResizeObserver) {
            resizeObserverRef.current = new ResizeObserver(debouncedFit)
            resizeObserverRef.current.observe(terminalRef.current)
        }

        // Fallback to window resize events
        const handleWindowResize = debouncedFit
        window.addEventListener('resize', handleWindowResize)

        // Initial fit after a short delay to ensure DOM is ready
        setTimeout(fitTerminal, 100)

        return () => {
            clearTimeout(resizeTimeout)
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect()
                resizeObserverRef.current = null
            }
            window.removeEventListener('resize', handleWindowResize)
        }
    }, [isReady, fitTerminal])

    useEffect(() => {
        if (!isReady) return
        if (!readlineRef.current) return
        if (!xtermRef.current) return

        function readLine() {
            if (!readlineRef.current) return
            while (!readlineRef.current.writeReady()) { }
            if (!process) {
                readlineRef.current.println(ANSI.RESET + ANSI.RED + "[No process found on project]" + ANSI.RESET);
                return
            }
            const safePrompt = typeof prompt === 'string' && prompt.length > 0 ? prompt : "> "
            readlineRef.current.read(safePrompt).then(processLine);
        }

        function clearLines(count: number) {
            for (let i = 0; i < count; i++) {
                xtermRef.current.write('\x1b[A'); // Move up 1 line
                xtermRef.current.write('\x1b[2K'); // Clear current line
            }
        }

        async function processLine(text: string) {
            if (!text || text.trim() == "") {
                return setTimeout(readLine, 100);
            }

            switch (text) {
                case "clear":
                    clearTerminalToInitialState()
                    break;
                default:
                    // Add input to history
                    if (process) {
                        addTerminalEntry(process, {
                            type: 'input',
                            content: text,
                            timestamp: Date.now()
                        })
                    }

                    // Start spinner
                    startSpinner();

                    try {
                        const result = await ao.runLua({ processId: process, code: text })
                        console.log(result)

                        // Stop spinner and clear the spinner line
                        stopSpinner()
                        // Move cursor up to overwrite the prompt line
                        clearLines(1)

                        let output = result.output.data
                        if (typeof output === "string")
                            if (output.endsWith("\nnil")) output = output.slice(0, -4)

                        const newPrompt = result.prompt
                        const finalPrompt = typeof newPrompt === 'string' && newPrompt.length > 0 ? newPrompt : "> "
                        setPrompt(finalPrompt)

                        // Update stored prompt and add output to history
                        if (process) {
                            setTerminalPrompt(process, finalPrompt)
                            addTerminalEntry(process, {
                                type: 'output',
                                content: output,
                                timestamp: Date.now()
                            })
                        }

                        // Print the output in place of the cleared lines
                        readlineRef.current.println(output)
                    } catch (error) {
                        // Stop spinner and clear the spinner line
                        stopSpinner()
                        // Move cursor up to overwrite the prompt line
                        clearLines(1)

                        const errorMessage = `[Error: ${error.message || 'Unknown error'}]`

                        // Add error to history
                        if (process) {
                            addTerminalEntry(process, {
                                type: 'error',
                                content: errorMessage,
                                timestamp: Date.now()
                            })
                        }

                        readlineRef.current.println(ANSI.RESET + ANSI.RED + errorMessage + ANSI.RESET)
                    }
            }

            setTimeout(readLine, 100);
        }

        readLine()

    }, [isReady, readlineRef, xtermRef, prompt, theme, process, addTerminalEntry, setTerminalPrompt, clearTerminalHistory, restoreTerminalHistory, clearTerminalToInitialState, ao, startSpinner, stopSpinner])

    return (
        <div className={cn("h-full w-full flex flex-col px-1.5 m-0", theme === "dark" ? "bg-black" : "bg-white")}>
            <div
                ref={terminalRef}
                className="flex-1 overflow-hidden"
                style={{
                    minHeight: 0,
                    padding: '0px',
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '14px',
                    lineHeight: '1',
                    letterSpacing: 'normal'
                }}
            />
        </div>
    )
}
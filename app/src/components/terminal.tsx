import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { useTheme } from './theme-provider'
import { ANSI, cn, isExecutionError, parseOutput } from '@/lib/utils'
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
    const [prompt, setPrompt] = useState("aos> ")

    // Terminal state management
    const { addTerminalEntry, setTerminalPrompt, clearTerminalHistory, getTerminalState } = useTerminalState(s => s.actions)
    const terminalState = process ? getTerminalState(process) : { history: [], prompt: "aos> " }

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
        xtermRef.current.writeln("")
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

        // Always show the current prompt in the terminal so user knows where to type
        xtermRef.current!.write(ANSI.RESET + state.prompt)
    }, [process, getTerminalState, showInitialTerminalState])

    // Function to clear terminal to initial state
    const clearTerminalToInitialState = useCallback(() => {
        if (!process || !xtermRef.current) return

        // Get current prompt before clearing
        const currentPrompt = prompt

        // Clear the stored history but preserve the prompt
        clearTerminalHistory(process)

        // Restore the prompt that was cleared
        setTerminalPrompt(process, currentPrompt)

        // Show initial state
        showInitialTerminalState()

        // Show the current prompt in the terminal so user knows where to type
        xtermRef.current.write(ANSI.RESET + currentPrompt)
    }, [process, prompt, clearTerminalHistory, setTerminalPrompt, showInitialTerminalState])


    useEffect(() => {
        if (!process) return

        // Always use stored prompt first, then fetch from server if needed
        const storedState = getTerminalState(process)

        // Set the stored prompt immediately
        setPrompt(storedState.prompt)

        // Only fetch from server if we don't have a stored prompt or it's the default
        if (!storedState.prompt || storedState.prompt === "aos> ") {
            const hashpath = `${settings.HB_URL}/${process}/now/results/output/prompt/~json@1.0/serialize`
            fetch(hashpath).then(res => res.json()).then(data => {
                const newPrompt = data.body || "aos> "
                setPrompt(newPrompt)
                setTerminalPrompt(process, newPrompt)
            }).catch(() => {
                // Keep the current stored prompt on error
                const currentPrompt = getTerminalState(process).prompt
                setPrompt(currentPrompt)
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
            if (domEvent.ctrlKey && (domEvent.key === 'l' || domEvent.key === 'L')) {
                domEvent.preventDefault()
                domEvent.stopPropagation()
                clearTerminalToInitialState()
                return false
            }
        })

        // Also add a global keydown listener to catch Ctrl+L before it reaches the browser
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && (event.key === 'l' || event.key === 'L')) {
                // Only handle if the terminal is focused or if we're in the terminal container
                const terminalContainer = terminalRef.current
                if (terminalContainer && (document.activeElement === terminalContainer || terminalContainer.contains(document.activeElement))) {
                    event.preventDefault()
                    event.stopPropagation()
                    clearTerminalToInitialState()
                }
            }
        }

        document.addEventListener('keydown', handleGlobalKeyDown, true)

        // Open terminal
        xterm.open(terminalRef.current)

        // Store references
        xtermRef.current = xterm
        fitAddonRef.current = fitAddon
        readlineRef.current = readline

        // Fit terminal to container (with safety check)
        setTimeout(() => {
            if (terminalRef.current) {
                const rect = terminalRef.current.getBoundingClientRect()
                if (rect.width > 0 && rect.height > 0) {
                    try {
                        fitAddon.fit()
                    } catch (error) {
                        console.warn('Initial terminal fit error:', error)
                    }
                }
            }
        }, 10)

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

            // Remove global keydown listener
            document.removeEventListener('keydown', handleGlobalKeyDown, true)

            xterm.dispose()
            xtermRef.current = null
            fitAddonRef.current = null
            readlineRef.current = null
            setIsReady(false)
        }
    }, [theme, restoreTerminalHistory, clearTerminalToInitialState])



    // Fit terminal to container with debouncing
    const fitTerminal = useCallback(() => {
        if (fitAddonRef.current && xtermRef.current && isReady && terminalRef.current) {
            // Check if the terminal container has proper dimensions
            const container = terminalRef.current
            const rect = container.getBoundingClientRect()

            // Only fit if container has actual dimensions
            if (rect.width > 0 && rect.height > 0) {
                try {
                    fitAddonRef.current.fit()
                } catch (error) {
                    console.warn('Terminal fit error:', error)
                }
            }
        }
    }, [isReady, xtermRef, terminalRef, fitAddonRef])

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
        setTimeout(fitTerminal, 150)

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
            const safePrompt = typeof prompt === 'string' && prompt.length > 0 ? prompt : "aos> "
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

                        // Stop spinner and clear only the spinner line
                        stopSpinner()

                        // Check if execution resulted in an error
                        const hasError = isExecutionError(result)
                        const parsedOutput = parseOutput(result)

                        const newPrompt = result.output?.prompt || result.prompt
                        const finalPrompt = typeof newPrompt === 'string' && newPrompt.length > 0 ? newPrompt : prompt
                        setPrompt(finalPrompt)

                        // Update stored prompt and add to history with appropriate type
                        if (process) {
                            setTerminalPrompt(process, finalPrompt)
                            addTerminalEntry(process, {
                                type: hasError ? 'error' : 'output',
                                content: parsedOutput,
                                timestamp: Date.now()
                            })
                        }

                        // Print the output with appropriate styling
                        if (hasError) {
                            readlineRef.current.println(ANSI.RESET + ANSI.RED + parsedOutput + ANSI.RESET)
                        } else {
                            readlineRef.current.println(parsedOutput)
                        }
                    } catch (error) {
                        // Stop spinner and clear only the spinner line
                        stopSpinner()

                        const errorMessage = `[Error: ${error.message || 'Unknown error'}]`

                        // Add error to history
                        if (process) {
                            addTerminalEntry(process, {
                                type: 'error',
                                content: errorMessage,
                                timestamp: Date.now()
                            })
                        }

                        // Print the error on a new line (command remains visible)
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
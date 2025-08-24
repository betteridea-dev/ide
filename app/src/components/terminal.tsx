import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { useTheme } from './theme-provider'
import { ANSI, cn } from '@/lib/utils'
import { useSettings } from '@/hooks/use-settings'
import { useProjects } from '@/hooks/use-projects'
import { useGlobalState } from '@/hooks/use-global-state'
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


    useEffect(() => {
        if (!process) return
        const hashpath = `${settings.HB_URL}/${process}/now/results/output/prompt/~json@1.0/serialize`
        fetch(hashpath).then(res => res.json()).then(data => {
            setPrompt(data.body || "> ")
        }).catch(() => {
            setPrompt("> ")
        })
    }, [process, theme])

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


        // Open terminal
        xterm.open(terminalRef.current)

        // Store references
        xtermRef.current = xterm
        fitAddonRef.current = fitAddon
        readlineRef.current = readline

        // Fit terminal to container
        fitAddon.fit()

        // print the ascii art with proper line breaks
        const asciiLines = AOS_ASCII.split('\n')
        asciiLines.forEach((line, index) => {
            if (index === 0 && line.trim() === '') return // Skip first empty line
            xterm.write(ANSI.RESET + ANSI.LIGHTBLUE + line + ANSI.RESET)
            if (index < asciiLines.length - 1) {
                xterm.write('\r\n') // Add proper carriage return + line feed
            }
        })
        xterm.write("\n" + ANSI.RESET + ANSI.DIM + "Connected to process: " + ANSI.RESET + ANSI.LIGHTBLUE + process + ANSI.RESET)
        xterm.write('\n\n\r\n')

        setIsReady(true)

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
    }, [theme])



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
                    xtermRef.current.clear()
                    break;
                default:
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
                        setPrompt(typeof newPrompt === 'string' && newPrompt.length > 0 ? newPrompt : "> ")

                        // Print the output in place of the cleared lines
                        readlineRef.current.println(output)
                    } catch (error) {
                        // Stop spinner and clear the spinner line
                        stopSpinner()
                        // Move cursor up to overwrite the prompt line
                        clearLines(1)

                        readlineRef.current.println(ANSI.RESET + ANSI.RED + `[Error: ${error.message || 'Unknown error'}]` + ANSI.RESET)
                    }
            }

            setTimeout(readLine, 100);
        }

        readLine()

    }, [isReady, readlineRef, xtermRef, prompt, theme])

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
import { useEffect, useRef, useState, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { useTheme } from './theme-provider'
import '@xterm/xterm/css/xterm.css'
import { cn } from '@/lib/utils'

export default function Terminal() {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)
    const [isReady, setIsReady] = useState(false)
    const { theme } = useTheme()

    // Get theme configuration
    const getThemeConfig = (currentTheme: string) => {
        return {
            background: currentTheme === "dark" ? "black" : "white",
            foreground: currentTheme === "dark" ? "white" : "black",
            cursor: currentTheme === "dark" ? "white" : "black",
            selectionBackground: currentTheme === "dark" ? "white" : "black",
            selectionForeground: currentTheme === "dark" ? "black" : "white",
            cursorAccent: currentTheme === "dark" ? "white" : "black",
        }
    }

    useEffect(() => {
        if (!terminalRef.current) return

        // Initialize terminal
        const terminal = new XTerm({
            smoothScrollDuration: 0,
            cursorBlink: true,
            cursorStyle: "bar",
            fontSize: 14,
            fontFamily: "monospace",
            cursorWidth: 25,
            theme: getThemeConfig(theme),
            allowTransparency: false,
            cols: 80,
            rows: 30,
            lineHeight: 1.2,
            letterSpacing: 0,
            fontWeight: 'normal',
            fontWeightBold: 'bold',
        })

        // Initialize addons
        const fitAddon = new FitAddon()
        const webLinksAddon = new WebLinksAddon()

        terminal.loadAddon(fitAddon)
        terminal.loadAddon(webLinksAddon)

        // Open terminal
        terminal.open(terminalRef.current)

        // Store references
        xtermRef.current = terminal
        fitAddonRef.current = fitAddon

        // Fit terminal to container
        fitAddon.fit()

        // Welcome message
        terminal.writeln('\x1b[1;32m[-------------------------------------]\x1b[0m')
        terminal.writeln('\x1b[1;32m[    Welcome to BetterIDEa Terminal   ]\x1b[0m')
        terminal.writeln('\x1b[1;32m[-------------------------------------]\x1b[0m')
        terminal.writeln('')
        terminal.writeln('\x1b[1;36mLinux-like terminal experience powered by xterm.js\x1b[0m')
        terminal.writeln('\x1b[0;33mType commands below:\x1b[0m')
        terminal.writeln('')

        // Simple command prompt
        let currentLine = ''
        const prompt = '\x1b[1;34m$\x1b[0m '
        terminal.write(prompt)

        // Handle input
        terminal.onData((data) => {
            const code = data.charCodeAt(0)

            if (code === 13) { // Enter
                terminal.writeln('')
                if (currentLine.trim()) {
                    handleCommand(currentLine.trim(), terminal)
                }
                currentLine = ''
                terminal.write(prompt)
            } else if (code === 127) { // Backspace
                if (currentLine.length > 0) {
                    currentLine = currentLine.slice(0, -1)
                    terminal.write('\b \b')
                }
            } else if (code >= 32) { // Printable characters
                currentLine += data
                terminal.write(data)
            }
        })

        setIsReady(true)

        // Cleanup
        return () => {
            terminal.dispose()
            xtermRef.current = null
            fitAddonRef.current = null
            setIsReady(false)
        }
    }, [])

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

    // Simple command handler
    const handleCommand = (command: string, terminal: XTerm) => {
        const args = command.split(' ')
        const cmd = args[0].toLowerCase()

        switch (cmd) {
            case 'help':
                terminal.writeln('\x1b[1;33mAvailable commands:\x1b[0m')
                terminal.writeln('  help     - Show this help message')
                terminal.writeln('  clear    - Clear the terminal')
                terminal.writeln('  echo     - Echo text back')
                terminal.writeln('  date     - Show current date and time')
                terminal.writeln('  whoami   - Show current user')
                terminal.writeln('  pwd      - Show current directory')
                terminal.writeln('  ls       - List directory contents')
                terminal.writeln('  cat      - Display file contents')
                terminal.writeln('  uname    - Show system information')
                break

            case 'clear':
                terminal.clear()
                break

            case 'echo':
                const text = args.slice(1).join(' ')
                terminal.writeln(text || '')
                break

            case 'date':
                terminal.writeln(new Date().toString())
                break

            case 'whoami':
                terminal.writeln('developer')
                break

            case 'pwd':
                terminal.writeln('/home/developer/betteridea')
                break

            case 'ls':
                terminal.writeln('\x1b[1;34mprojects/\x1b[0m    \x1b[1;32mREADME.md\x1b[0m    \x1b[0;33mpackage.json\x1b[0m')
                terminal.writeln('\x1b[1;34msrc/\x1b[0m         \x1b[1;32mLICENSE\x1b[0m      \x1b[0;33mtsconfig.json\x1b[0m')
                break

            case 'cat':
                if (args[1]) {
                    switch (args[1]) {
                        case 'README.md':
                            terminal.writeln('# BetterIDEa')
                            terminal.writeln('A modern IDE for AO development')
                            break
                        case 'package.json':
                            terminal.writeln('{')
                            terminal.writeln('  "name": "betteridea",')
                            terminal.writeln('  "version": "4.0.0"')
                            terminal.writeln('}')
                            break
                        default:
                            terminal.writeln(`cat: ${args[1]}: No such file or directory`)
                    }
                } else {
                    terminal.writeln('cat: missing file operand')
                }
                break

            case 'uname':
                if (args[1] === '-a') {
                    terminal.writeln('BetterIDEa 4.0.0 #1 SMP Web Terminal x86_64 GNU/Linux')
                } else {
                    terminal.writeln('BetterIDEa')
                }
                break

            default:
                if (command.trim()) {
                    terminal.writeln(`\x1b[1;31mbash: ${cmd}: command not found\x1b[0m`)
                }
        }
    }

    return (
        <div className={cn("h-full w-full flex flex-col p-0 m-0", theme === "dark" ? "bg-black" : "bg-white")}>
            <div
                ref={terminalRef}
                className="flex-1 overflow-hidden"
                style={{
                    minHeight: 0,
                    padding: '0px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1',
                    letterSpacing: 'normal'
                }}
            />
        </div>
    )
}
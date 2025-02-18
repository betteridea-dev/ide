import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectManager } from "@/hooks";
import { useGlobalState } from "@/hooks/useGlobalState";
import { TCell } from "@/hooks/useProjectManager";
import Ansi from "ansi-to-react";
import { BetweenHorizonalStart, Copy, Eraser, FilePlus2, Loader2, Plus } from "lucide-react";
import { ChangeEvent, KeyboardEventHandler, useEffect, useState, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { v4 } from "uuid";
import { MentionsInput, Mention } from 'react-mentions'

interface ChatMessage {
    role: "assistant" | "user",
    // parts: { text: string }[]
    content: string
}

const defaultChat: ChatMessage[] = [{ role: "assistant", content: "👋 Hello! I'm happy to help with any questions or issues you have regarding AO  / aos development.\n\nWhat's on your mind? Do you have a specific question or topic you'd like to discuss? 😊\n\nTip: use @ to mention a file and @@ to mention a cell (only in notebooks)" }]

export default function AiPanel() {

    const { activeProject, activeFile } = useGlobalState()
    const manager = useProjectManager()
    const projects = manager.projects
    const [inputText, setInputText] = useState("")
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(defaultChat)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        document.getElementById("chat-messages")?.scrollTo({ top: document.getElementById("chat-messages")?.scrollHeight, behavior: "smooth" })
    }, [chatMessages])

    async function handleInference() {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true)
        try {
            // Process cell mentions
            let processedInput = inputText.replace(
                /@\[cell:\d+\]\(([\w-]+)\)/g,
                (match, cellId) => {
                    const cell = projects[activeProject].files[activeFile].content.cells[cellId];
                    return cell ? `\n\`\`\`\n${cell.code}\n\`\`\`\n` : match;
                }
            );

            // Process file mentions
            processedInput = processedInput.replace(
                /@\[([^\]]+)\]\(([^\)]+)\)/g,
                (match, label, fileName) => {
                    const file = projects[activeProject].files[fileName];
                    if (!file) return match;
                    const code = file.type === "NORMAL"
                        ? file.content.cells[0].code
                        : file.content.cellOrder.map(cellId => projects[activeProject].files[activeFile].content.cells[cellId].code).join("\n\n");
                    return `\n\`\`\`\n${code}\n\`\`\`\n`;
                }
            );

            console.log(processedInput)

            setInputText("");
            setChatMessages(prev => [...prev, { role: 'user', content: processedInput }]);
            // const newChat = [...chatMessages, { role: 'user', content: processedInput }]

            let payload = {}
            if (activeProject && activeFile) {
                const file = manager.getProject(activeProject).getFile(activeFile)

                if (file.type == "NORMAL") {
                    payload = {
                        message: processedInput,
                        fileContext: file.content.cells[0].code,
                        chat: chatMessages
                    }
                } else {
                    payload = {
                        message: processedInput,
                        fileContext: file.content.cellOrder.map(cellId => file.content.cells[cellId].code).join("\n---\n"),
                        chat: chatMessages
                    }
                }
            } else {
                payload = {
                    message: processedInput,
                    fileContext: "",
                    chat: chatMessages
                }
            }


            const prod_endpoint = "https://api.betteridea.dev/chat"
            const dev_endpoint = "http://localhost:3001/chat"
            // if running on localhost, use dev_endpoint
            const response = await fetch(window.location.hostname === "localhost" ? dev_endpoint : prod_endpoint, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            const data = await response.json()
            setChatMessages(prev => [...prev, { role: "assistant", content: data.response }] as ChatMessage[])
        } catch (error) {
            console.error('Error:', error)
            setChatMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, there was an error processing your request."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleInference();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputText(value);

    };

    // if (!activeFile) {
    //     return <div className="p-6 text-center h-2/3 flex items-center justify-center">
    //         <div className="text-sm text-muted-foreground">
    //             Open a file to use AI
    //         </div>
    //     </div>
    // }

    return <div className="flex flex-col items-center justify-start h-full max-h-[calc(100vh-50px)]">
        <div className="flex gap-2 w-full border-b">
            <Button variant="ghost" className="rounded-none">AI CHAT</Button>
            {/* clear btn */}
            <Button variant="ghost" className="rounded-none ml-auto" onClick={() => { setChatMessages(defaultChat) }}><Eraser size={16} /></Button>
        </div>
        <div id="chat-messages" className="w-full flex flex-col gap-1 overflow-y-scroll text-sm">
            {
                chatMessages.map((msg, i) => {
                    switch (msg.role) {
                        case "assistant":
                            return <pre className="p-1.5 whitespace-break-spaces break-words text-justify">
                                <Markdown remarkPlugins={[remarkGfm]} components={{
                                    pre: ({ children }) => {
                                        return <div className="border">
                                            <div className="border-b p-0.5 flex items-center justify-end gap-1">
                                                {activeProject && projects[activeProject].files[activeFile] && projects[activeProject].files[activeFile].type == "NORMAL" && <Button variant="ghost" className="p-0 w-5 h-5 rounded-none" title="Append to end of file"
                                                    onClick={() => {
                                                        const project = manager.getProject(activeProject)
                                                        const file = project.getFile(activeFile)
                                                        file.content.cells[0].code += (children as any).props.children
                                                        manager.updateFile(project, { file: file, content: file.content })
                                                    }}>
                                                    <FilePlus2 size={16} />
                                                </Button>}
                                                {activeProject && projects[activeProject].files[activeFile] && projects[activeProject].files[activeFile].type == "NOTEBOOK" && <Button variant="ghost" className="p-0 w-5 h-5 rounded-none" title="Insert into new cell"
                                                    onClick={() => {
                                                        const project = manager.getProject(activeProject)
                                                        const file = project.getFile(activeFile)

                                                        const newCell: TCell = {
                                                            code: (children as any).props.children,
                                                            output: null,
                                                            type: "CODE",
                                                            editing: true,
                                                        }

                                                        const newCellId = v4()
                                                        file.content.cells[newCellId] = newCell
                                                        file.content.cellOrder.push(newCellId)
                                                        manager.updateFile(project, { file: file, content: file.content })

                                                    }}
                                                >
                                                    <BetweenHorizonalStart size={16} />
                                                </Button>}
                                                <Button variant="ghost" className="p-0 w-5 h-5 rounded-none" title="Copy to clipboard"
                                                    onClick={() => { navigator.clipboard.writeText((children as any).props.children) }}>
                                                    <Copy size={16} />
                                                </Button>
                                            </div>
                                            <pre className="overflow-scroll p-1 bg-primary/10">{children}</pre>
                                        </div>
                                    }
                                }}>{msg.content}</Markdown>
                            </pre>
                        case "user":
                            return <div className="bg-muted/10 mt-5 text-muted-foreground/80 p-1.5 whitespace-break-spaces break-words flex items-center gap-1">
                                <pre className="w-full">
                                    <Markdown
                                        className="w-full"
                                        components={{
                                            pre: ({ children }) => {
                                                return <div className="border w-full">
                                                    <pre className="overflow-scroll p-1 w-full">{children}</pre>
                                                </div>
                                            }
                                        }}
                                        remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                                </pre>
                            </div>
                        default:
                            "shrug"
                    }
                })
            }
        </div>
        {isLoading && <div className="w-full h-fit bg-muted/10 flex items-center justify-start gap-2 p-2">
            <Loader2 className="animate-spin" size={14} />
            <span className="text-muted-foreground">Thinking...</span>
        </div>}
        <div className="w-full h-fit bg-black/5">
            <MentionsInput
                disabled={isLoading}
                value={inputText}
                onChange={handleInputChange}
                placeholder="Ask AI here"
                className="w-full rounded-none placeholder:text-muted focus-visible:ring-0 bg-muted/20 resize-none p-2"
                onKeyDown={handleKeyDown}
                allowSuggestionsAboveCursor
                forceSuggestionsAboveCursor
                style={{
                    control: {
                        backgroundColor: 'transparent',
                        fontWeight: 'normal',
                    },
                    input: {
                        padding: '8px',
                        backgroundColor: 'transparent',
                    }
                }}
            >
                {/* file mentions */}
                <Mention trigger="@"
                    appendSpaceOnAdd
                    renderSuggestion={(
                        suggestion,
                        search,
                        highlightedDisplay,
                        index,
                        focused
                    ) => {
                        return (
                            <div data-focused={focused} className="p-1 px-2 bg-primary/20 dark:text-background data-[focused=true]:bg-primary/50">
                                {suggestion.display}
                            </div>
                        )
                    }}
                    className="bg-primary/50"
                    data={activeProject ? Object.values(projects[activeProject].files).map(file => ({ id: `${file.name}`, display: `${file.name}` })) : []}
                />
                {/* cell mentions in active file */}
                {activeProject && projects[activeProject].files[activeFile] && projects[activeProject].files[activeFile].type == "NOTEBOOK" &&
                    <Mention trigger="@@"
                        appendSpaceOnAdd
                        renderSuggestion={(
                            suggestion,
                            search,
                            highlightedDisplay,
                            index,
                            focused
                        ) => {
                            return (
                                <div data-focused={focused} className="p-1 px-2 bg-primary/20 dark:text-background data-[focused=true]:bg-primary/50">
                                    {suggestion.display}
                                </div>
                            )
                        }}
                        className="bg-primary/50"
                        data={activeProject ? Object.values(projects[activeProject].files[activeFile].content.cellOrder).map((cellId, index) => ({ id: `${cellId}`, display: `cell:${index + 1}` })) : []}
                    />}
            </MentionsInput>
        </div>
    </div>
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectManager } from "@/hooks";
import { useGlobalState } from "@/hooks/useGlobalState";
import Ansi from "ansi-to-react";
import { Copy, Eraser, Plus } from "lucide-react";
import { KeyboardEventHandler, useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
    role: "assistant" | "user",
    content: string
}

const defaultChat: ChatMessage[] = [
    { role: "assistant", content: "👋 Hello! I'm happy to help with any questions or issues you have regarding AO  / aos development. What's on your mind? Do you have a specific question or topic you'd like to discuss? 😊" },
]

export default function AiPanel() {
    const { activeProject, activeFile } = useGlobalState()
    const { projects } = useProjectManager()
    const [inputText, setInputText] = useState("")
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(defaultChat)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        document.getElementById("chat-messages")?.scrollTo({ top: document.getElementById("chat-messages")?.scrollHeight, behavior: "smooth" })
    }, [chatMessages])

    async function handleInput() {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true)
        try {
            // Create chat history array
            const chatHistory = chatMessages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))

            chatHistory.push({
                role: 'user',
                content: inputText
            })

            setChatMessages(prev => [...prev, { role: "user", content: inputText }])
            setInputText("")

            const response = await fetch("http://localhost:3001/chat", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: inputText,
                    chat: chatHistory,
                    fileContext: projects[activeProject].files[activeFile].type == "NORMAL"
                        ? projects[activeProject].files[activeFile].content.cells[0].code
                        : Object.values(projects[activeProject].files[activeFile].content.cells).map(cell => cell.code).join("\n\n"),
                    currentFile: projects[activeProject].files[activeFile].name,
                    visibleRange: projects[activeProject].files[activeFile].type == "NORMAL"
                        ? projects[activeProject].files[activeFile].content.cells[0].code
                        : Object.values(projects[activeProject].files[activeFile].content.cells).map(cell => cell.code).join("\n\n"),
                })
            })
            const data = await response.json()
            setChatMessages(prev => [...prev, { role: "assistant", content: data.response }])
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

    if (!activeFile) {
        return <div className="p-6 text-center h-2/3 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
                Open a file to use AI
            </div>
        </div>
    }

    return <div className="flex flex-col items-center justify-start h-full max-h-[calc(100vh-50px)]">
        <div className="flex gap-2 w-full border-b">
            <Button variant="ghost" className="rounded-none">CHAT</Button>
            {/* clear btn */}
            <Button variant="ghost" className="rounded-none ml-auto" onClick={() => { setChatMessages(defaultChat) }}><Eraser size={16} /></Button>
        </div>
        <div id="chat-messages" className="w-full p-1 flex flex-col gap-1 overflow-y-scroll text-sm">
            {
                chatMessages.map(msg => {
                    switch (msg.role) {
                        case "assistant":
                            return <pre className="p-1 whitespace-break-spaces break-words text-justify">
                                <Markdown remarkPlugins={[remarkGfm]} components={{
                                    pre: ({ children }) => {
                                        return <div className="border">
                                            <div className="border-b p-0.5 flex items-center justify-end">
                                                <Button variant="ghost" className="p-0 w-5 h-5 rounded-none" onClick={() => { navigator.clipboard.writeText((children as any).props.children) }}>
                                                    <Copy size={16} /></Button>
                                            </div>
                                            <pre className="overflow-scroll p-1 bg-primary/10">{children}</pre>
                                        </div>
                                    }
                                }}>{msg.content}</Markdown>
                            </pre>
                        case "user":
                            return <div className="bg-muted/10 mt-5 text-muted p-1 px-2 whitespace-break-spaces break-words">{msg.content}</div>
                        default:
                            "shrug"
                    }
                })
            }
        </div>
        <div className="w-full h-fit p-2">
            <Input className="rounded-none placeholder:text-muted focus-visible:ring-0 bg-muted/10" placeholder="Ask AI here" value={inputText} onKeyDown={e => { if (e.code == "Enter") { handleInput() } }} onChange={e => setInputText(e.target.value)} />
        </div>
    </div>
}
import { connect, createDataItemSigner, result } from "@permaweb/aoconnect";
import { useEffect, useState } from "react"
import { AOModule, AOScheduler, AOChatPID } from "../../config"

interface message {
    from: string,
    content: string,
    timestamp: number,

}

const d = new Date();

function tsToDate(ts: number) {
    const d = new Date(ts)
    return `${d.toDateString()} ${d.toTimeString()}`
}

export default function AOChat() {
    const [myProcess, setMyProcesses] = useState<string>("")
    const [spawning, setSpawning] = useState<boolean>(false);
    const [sending, setSending] = useState<boolean>(false);
    const [input, setInput] = useState<string>("")
    const [loop, setLoop] = useState<NodeJS.Timeout>()
    const [messages, setMessages] = useState<message[]>([{
        from: "AO",
        content: "To start chatting, send /join",
        timestamp: Date.now()
    }]);

    async function spawnProcess() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (window as any).arweaveWallet.connect([
            "ACCESS_ADDRESS",
            "SIGN_TRANSACTION",
        ]);
        if (myProcess) return alert("already spawned");
        setSpawning(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signer = createDataItemSigner((window as any).arweaveWallet);
        console.log(signer);
        const res = await connect().spawn({
            module: AOModule,
            scheduler: AOScheduler,
            signer,
            tags: [],
        });
        console.log(res);
        setMyProcesses(res);
        localStorage.setItem("mypid", res);
        setSpawning(false);
    }

    useEffect(() => {
        const mypid = localStorage.getItem("mypid")
        if (mypid) {
            setMyProcesses(mypid)
        } else {
            spawnProcess()
        }
    }, [])

    // useEffect(() => {
    //     async function monitor() {
    //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         const signer = createDataItemSigner((window as any).arweaveWallet);
    //         const res = await connect().monitor({
    //             process: myProcess,
    //             signer,
    //         })
    //         console.log(res)
    //     }
    //     monitor()
    // }, [])

    useEffect(() => {
        clearTimeout(loop)
        if (!myProcess) return
        async function getInbox() {
            if (!myProcess) return
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (window as any).arweaveWallet.connect([
                "ACCESS_ADDRESS",
                "SIGN_TRANSACTION",
            ]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const signer = createDataItemSigner((window as any).arweaveWallet);
            try {
                const res = await connect().message({
                    process: myProcess,
                    signer,
                    tags: [{ name: "Action", value: "Eval" }],
                    data: `Inbox`
                })
                const resdata = await result({
                    process: myProcess,
                    message: res
                })
                console.log(resdata)
                const inbox = resdata.Output.data.json
                const messages: message[] = [{
                    from: "AO",
                    content: "To start chatting, send /join",
                    timestamp: Date.now()
                }]
                for (const msg in inbox) {
                    // console.log(inbox[msg])
                    if (inbox[msg].Tags.Type == "Message" && inbox[msg].Data) {
                        const m: message = JSON.parse(inbox[msg].Data)
                        console.log(m)
                        messages.unshift(m)
                    }
                }
                console.log(messages.length, "messages")
                setMessages(messages)
                setLoop(setTimeout(() => getInbox(), 2500))
            }
            catch (e) {
                console.log(e.message)
            }
        }
        setLoop(setTimeout(() => getInbox(), 1000))
        return () => clearTimeout(loop)
    }, [myProcess])

    async function keyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            if (!input) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const signer = createDataItemSigner((window as any).arweaveWallet);
            setSending(true)
            if (input.startsWith("/join")) {
                console.log("joining")
                const res = await connect().message({
                    process: myProcess,
                    signer,
                    tags: [{ name: "Action", value: "Eval" }],
                    data: `ao.send({Target="${AOChatPID}", Tags={Action="Register"}})`
                })
                const resdata = await result({
                    process: myProcess,
                    message: res
                })
                console.log(resdata.Output.data.output)
            } else if (input == "Inbox") {
                const res = await connect().message({
                    process: myProcess,
                    signer,
                    tags: [{ name: "Action", value: "Eval" }],
                    data: "Inbox"
                })
                const resdata = await result({
                    process: myProcess,
                    message: res
                })
                console.log(resdata.Output.data.output)
            } else {
                const msg: message = { from: myProcess, timestamp: Date.now(), content: input }
                const d = `ao.send({Target="${AOChatPID}", Tags={Action="Broadcast"}, Data="${JSON.stringify(msg).replace(/"/g, '\\"')}"})`
                console.log(d)
                const res = await connect().message({
                    process: myProcess,
                    signer,
                    tags: [{ name: "Action", value: "Eval" }],
                    data: d
                })
                const resdata = await result({
                    process: myProcess,
                    message: res
                })
                console.log(resdata.Output.data.output)
            }
            setSending(false)
            setInput("")
        }
    }

    return <div className="p-2 h-[calc(100vh-110px)]">
        <div className="flex justify-between">
            <div>Welcome to AO chatroom!</div>
            <div>Here you can talk with other people through AO</div>
            <div>Your ID: <pre className="inline">{myProcess}</pre></div>
        </div>
        <div className="w-full h-full bg-black/30 p-2 overflow-scroll flex flex-col-reverse gap-5">
            {
                messages.map((message, index) => {
                    return <div key={index} className="flex flex-col font-mono">
                        <div className="text-md opacity-70">{message.from}</div>
                        <div className="text-xs opacity-50">{tsToDate(message.timestamp)}</div>
                        <div className="text-lg">- {message.content}</div>
                    </div>
                })
            }
        </div>
        <input type="text" className="w-full bg-white/80 outline-none p-1 text-black" disabled={sending} value={input} placeholder="Type message here" onKeyDown={(e) => keyDown(e)} onChange={(e) => setInput(e.target.value)} />
    </div>
}
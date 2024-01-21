import { connect, createDataItemSigner, result } from "@permaweb/aoconnect";
import { useEffect, useState } from "react"

interface message {
    from: string,
    content: string,
    timestamp: number,

}

const d = new Date();

function tsToDate(ts: number) {
    const d = new Date(ts)
    return `${d.getMinutes()}:${d.getSeconds()}, ${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`
}

const chatProcess = "7rSbEX6WGCGW5FdAAqDux8ZO3B9taCN9-AB0N_ypnMI";

export default function AOChat() {
    const [myProcess, setMyProcesses] = useState<string>("")
    const [spawning, setSpawning] = useState<boolean>(false);
    const [input, setInput] = useState<string>("")
    const [loop, setLoop] = useState<boolean>(true)
    const [messages, setMessages] = useState<message[]>([{
        from: "AO",
        content: "To start chatting, send /register",
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
            module: "Twp4qeQOQ6ht3nKaZu8RuHc8QpJRW95W8h0WqJ8qlgw",
            scheduler: "TZ7o7SIZ06ZEJ14lXwVtng1EtSx60QkPy-kh-kdAXog",
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
        setLoop(true)
        async function getInbox() {
            if (!myProcess) return
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (window as any).arweaveWallet.connect([
                "ACCESS_ADDRESS",
                "SIGN_TRANSACTION",
            ]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const signer = createDataItemSigner((window as any).arweaveWallet);
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
            // const inbox = JSON.parse(resdata.Output.data.output)
            // console.log(resdata.Output.data.output)
            // setMessages(inbox)
            // if (loop)
            getInbox()
        }
        getInbox()
        return () => setLoop(false)
    }, [myProcess])

    async function keyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            if (!input) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const signer = createDataItemSigner((window as any).arweaveWallet);
            if (input.startsWith("/register")) {
                const res = await connect().message({
                    process: myProcess,
                    signer,
                    tags: [{ name: "Action", value: "Eval" }],
                    data: `ao.send({Target="${chatProcess}", Tags={Action="Register"}})`
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
                const d = `ao.send({Target="${chatProcess}", Tags={Action="Broadcast"}, Data="${JSON.stringify(msg).replace(/"/g, "'")}"})`
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
            setInput("")
        }
    }

    return <div className="p-2 h-[calc(100vh-110px)]">
        <div className="flex justify-between">
            <div>Welcome to AO chatroom!</div>
            <div>Here you can talk with other people through AO</div>
            <div>Your ID: <pre className="inline">{myProcess}</pre></div>
        </div>
        <div className="w-full h-full bg-black/30 p-2 overflow-scroll">
            {
                messages.map((message, index) => {
                    return <div key={index} className="flex flex-col">
                        <div className="text-md text-gray-500">{tsToDate(message.timestamp)} - {message.from}</div>
                        <div className="text-lg">{message.content}</div>
                    </div>
                })
            }
        </div>
        <input type="text" className="w-full bg-white/80 outline-none p-1 text-black" value={input} placeholder="Type message here" onKeyDown={(e) => keyDown(e)} onChange={(e) => setInput(e.target.value)} />
    </div>
}
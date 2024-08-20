import { CodeCell, getInbox } from "@betteridea/codecell";
import Ansi from "ansi-to-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Dev() {
    const devMode = typeof window == "undefined" ? true : window.location.hostname === "localhost";
    const [inbox, setInbox] = useState<any>();

    return (
        <div className="flex flex-col items-center justify-center gap-5 p-5">
            <button onClick={() => getInbox("1", devMode)}>getInbox</button>
            <CodeCell
                cellId="1" // any unique cell id
                appName="BetterIDEa" // Your unique app name
                code="print('Portable code cell ftw!')" // initial code (optional)
                devMode
                nowallet
                onNewMessage={(message) => {
                    message.forEach((m) => {
                        if (m.Output)
                            if (m.Output.print)
                                // console.log(m.Output.data)
                                toast.custom(() => <Ansi>{m.Output.data}</Ansi>)
                    })
                }}
                onAOProcess={(ao) => console.log("got process", ao)}
                onInbox={(inbox) => setInbox(inbox)}
            />
            <pre className='w-screen overflow-scroll px-2'>
                {JSON.stringify(inbox, null, 2)}
            </pre>
        </div>
    )
}

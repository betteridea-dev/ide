import { useGlobalState } from "@/hooks";
import { MsgHistory } from "@/hooks/useGlobalState";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function History() {
    const globalState = useGlobalState();

    useEffect(() => {
        console.log(globalState.history)
    }, [globalState.history])

    return (
        <div>
            {
                !globalState.history[globalState.activeProject] && <div className="text-center text-sm text-gray-400 p-4">No history available</div>
            }
            {
                globalState.history[globalState.activeProject] && globalState.history[globalState.activeProject].toReversed().map((msg: MsgHistory) => {
                    return (
                        <div key={msg.id} className="flex items-start space-x-6 font-btr-code p-4 border-b">
                            <div className="flex flex-col gap-1">
                                <div className="flex gap-2 items-center">
                                    <div className="text-sm text-gray-400 ">{new Date(msg.timestamp).toLocaleString()}</div>
                                    <Link href={`https://www.ao.link/#/message/${msg.id}`} target="_blank" className="flex items-center text-primary text-sm">ao.link <ExternalLink size={16} className="ml-1" /></Link>
                                </div>
                                <div className="text-xs">{msg.id}</div>
                            </div>
                            <pre className="text-xs max-h-[200px] overflow-scroll">{msg.code}</pre>
                        </div>
                    )
                })
            }
        </div>
    )
}
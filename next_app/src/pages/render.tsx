import { BoilerplateAsset } from "@/components/menubar/components/publish-boilerplate"
import { useGlobalState, useProjectManager } from "@/hooks";
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

function extractHandlerNames(luaCode: string) {
    luaCode = luaCode.replaceAll(/--.*\n/g, "").replaceAll(/--.*$/gm, "").replaceAll("'", '"').replaceAll("[[", '"').replaceAll("]]", '"');
    const handlerPattern = /Handlers\.add\(\s*"([^"]+)"/g;
    const handlers = [];
    let match;

    while ((match = handlerPattern.exec(luaCode)) !== null) {
        handlers.push(match[1]);
    }

    return handlers;
}

export default function TxRenderer() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [txData, setTxData] = useState<BoilerplateAsset>(null)
    const [fileCount, setFileCount] = useState(0)
    const [handlerCount, setHandlerCount] = useState(0)
    const router = useRouter()
    const { tx } = router.query
    console.log(tx)

    useEffect(() => {
        if (!tx) return
        fetch(`https://arweave.net/${tx}`)
            .then(res => res.json())
            .then((res) => {
                setTxData(res)
            })
    }, [tx])

    useEffect(() => {
        if (!txData) return
        async function parseBoilerplate() {
            const fileNames = Object.keys(txData.files);
            const sourceSummed = fileNames.map(fileName => {
                const file = txData.files[fileName];
                if (file.type == "NORMAL")
                    return file.content.cells[0].code;
                else {
                    const cells = [];
                    for (const cellId of file.content.cellOrder) {
                        cells.push(file.content.cells[cellId].code);
                    }
                    return cells.join("\n");
                }
            }).join("\n");
            const handlers = extractHandlerNames(sourceSummed);
            console.log("files:", fileNames.length, " handlers:", handlers.length);
            setFileCount(fileNames.length);
            setHandlerCount(handlers.length);
        }
        parseBoilerplate()
    }, [txData])

    // return <pre>{JSON.stringify(txData, null, 2)}</pre>

    return <div className="bg-background ring-1 ring-primary m-0.5 aspect-square w-fit p-5 rounded-lg flex flex-col items-center justify-center">
        <div className="font-semibold italic text-4xl">{txData?.name}</div>
        <div>{txData?.description}</div>
        <div>{fileCount} Files · {handlerCount} Handlers</div>
    </div>
}
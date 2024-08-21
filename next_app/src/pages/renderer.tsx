import { TemplateAsset } from "@/components/menubar/components/publish-template"
import { useGlobalState, useProjectManager } from "@/hooks";
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { extractHandlerNames } from "@/lib/utils";
import { toast } from "sonner";
import { gql, GraphQLClient } from "graphql-request";
import { Tag } from "@/lib/ao-vars";
import { Files, FunctionSquare } from "lucide-react";
import { CodeCell } from "@betteridea/codecell";

export default function TxRenderer({ id_ }: { id_: string }) {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [txData, setTxData] = useState<TemplateAsset>(null)
    const [fileCount, setFileCount] = useState(0)
    const [handlerCount, setHandlerCount] = useState(0)
    const [activeFile, setActiveFile] = useState<number>(-1)
    const router = useRouter()
    const { tx } = router.query


    useEffect(() => {
        toast.dismiss("connected")
        if (!id_ && !tx) return
        const fetchId = id_ || tx

        const gqlQuery = gql`query {
  transactions(
			ids:["${fetchId}"]
  ) {
    edges {
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
}
`

        const client = new GraphQLClient("https://arweave.net/graphql")
        client.request(gqlQuery).then((data) => {
            const dataTags: Tag[] = (data as any).transactions.edges[0].node.tags
            const tags = dataTags.reduce((acc, tag) => {
                acc[tag.name] = tag.value
                return acc
            })
            console.log(tags)
            const filesTxId = tags["Template-Files"]

            console.log("fetching tx data", filesTxId)
            fetch(`https://arweave.net/${filesTxId}`)
                .then(res => res.json())
                .then((res) => {
                    console.log(res)
                    setTxData({
                        name: tags['Title'],
                        description: tags['Description'],
                        files: res
                    })
                })
        }).catch((e) => {
            console.error(e)
            toast.error("Error fetching transaction data")
        })
    }, [id_, tx])

    useEffect(() => {
        if (!txData) return
        async function parseTemplate() {
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
        parseTemplate()
    }, [txData])


    return <div className="!bg-background ring-primary w-screen h-screen flex flex-col items-center justify-start">
        {((tx && tx.length != 43) || (id_ && id_.length != 43)) ? <div className="text-muted">Invalid Process ID</div> : <>
            <div className="rounded grid grid-cols-4 w-[calc(100vw-0.5rem)] bg-muted/20 m-1 p-1">
                <div className="col-span-3">
                    <div className="font-semibold text-xl">{txData?.name}</div>
                    <div className="text-muted-foreground">{txData?.description}</div>
                </div>
                <div className="flex flex-col gap-1 items-end text-muted-foreground">
                    <div className="flex items-center gap-1">{fileCount} Files <Files size={18} className="inline-block" /> </div>
                    <div className="flex items-center gap-1">{handlerCount} Handlers <FunctionSquare size={18} className="inline-block" /></div>
                </div>
            </div>
            <div className="grid grid-cols-4 w-full h-full">
                <div className="">
                    {
                        txData?.files && txData.files.map((file, _) => {
                            return <div data-active={activeFile == _} className="p-0.5 px-1 m-0.5 overflow-scroll data-[active=true]:bg-muted/20 hover:!bg-muted/40 cursor-pointer rounded" key={_} onClick={e => setActiveFile(_)}>{file.name}</div>
                        })
                    }
                </div>
                <div className="col-span-3 flex items-center justify-center">
                    {
                        activeFile >= 0 ? <div className="p-1 w-full bg-background rounded text-xs overflow-scroll h-full">
                            {
                                txData.files[activeFile].type == "NORMAL" && <CodeCell code={txData.files[activeFile].content.cells[0].code} appName="BetterIDEa-Renderer" cellId="0" nowallet={!!window.arweaveWallet} height="100%" />
                            }
                            {
                                txData.files[activeFile].type == "NOTEBOOK" && <div className="flex flex-col gap-2">{txData.files[activeFile].content.cellOrder.map((cellId) => txData.files[activeFile].content.cells[cellId].code).map((code, _) => {
                                    return <CodeCell key={_} code={code} appName="BetterIDEa-Renderer" cellId={_.toString()} nowallet={!!window.arweaveWallet} height="200px" />
                                })}</div>
                            }
                        </div> : <div className="text-center">Select a file to view its contents</div>
                    }
                </div>
            </div>
        </>}
    </div>
}
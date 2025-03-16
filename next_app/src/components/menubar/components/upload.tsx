import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGlobalState, useProjectManager } from "@/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Arweave from "arweave";
import { useLocalStorage } from "usehooks-ts";
import { AppVersion, Tag } from "@/lib/ao-vars";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader } from "lucide-react";
import { GraphQLClient, gql } from "graphql-request";
import Link from "next/link";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";

type Transaction = {
    id: string;
    tags: Tag[];
}

export default function Upload() {
    const { connected, connect, disconnect } = useConnection()
    const address = useActiveAddress()
    const [popupOpen, setPopupOpen] = useState(false);
    const [fileDragOver, setFileDragOver] = useState(false);
    const [price, setPrice] = useState<string>();
    const [file, setFile] = useState<File>();
    const [uploading, setUploading] = useState(false);
    const [history, setHistory] = useLocalStorage<Transaction[]>("upload-history", [], { initializeWithValue: true });

    const ar = new Arweave({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
    });


    async function upload() {
        setUploading(true)
        const txn = await ar.createTransaction({
            data: new Uint8Array(await file?.arrayBuffer())
        }, "use_wallet")
        txn.addTag("Content-Type", file?.type || "application/octet-stream")
        txn.addTag("App-Name", "BetterIDEa")
        txn.addTag("App-Version", AppVersion)
        txn.addTag("BetterIDEa-Function", "Upload-Utility")
        txn.addTag("File-Name", file?.name || "unknown")
        console.log(txn)
        try {
            await ar.transactions.sign(txn, "use_wallet")
            console.log(txn)
            await ar.transactions.post(txn)
        } catch (e) {
            console.error(e)
            toast.error(e, { id: "error" })
        } finally {
            // setHistory([...history, id])
            setUploading(false)
        }
    }

    async function handleFileDrop(e: any) {
        e.preventDefault();
        setFileDragOver(false)
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (files.length == 0) return toast.error("No files dropped", { id: "error" })
        const file = files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const bytes = new Uint8Array(e.target?.result as ArrayBuffer);
            console.log(bytes)
            const price = ar.ar.winstonToAr(await ar.transactions.getPrice(bytes.byteLength, address))
            setPrice(price)
            setFile(file)
        }
        reader.readAsArrayBuffer(file);
    }

    function handleFileDragOver(e: any) {
        e.preventDefault();
        setFileDragOver(true);
        // console.log(e)
    }

    async function getUploadHistory() {
        if (!connected) return
        if (!address) return
        const query = `
query {
    transactions(
        owners: ["${address}"],
        tags: [
          	{
                name: "App-Name",
                values: ["BetterIDEa"]
            },
          	{
              name:"BetterIDEa-Function",
              values:["Upload-Utility"]
            },
            #{
            #    name:"File-Name",
            #    values:"*"
            #}
        ]
    ) {
        edges {
            node {
                id,
                tags{
                    name,
                    value
                }
            }
        }
    }
}
    `
        const client = new GraphQLClient("https://arweave.net/graphql")
        const { transactions: { edges } } = await client.request(query) as any
        console.log(edges)
        setHistory(edges.map((e: any) => e.node))
    }

    useEffect(() => {
        getUploadHistory()
    }, [connected, address])

    return (
        <Dialog open={popupOpen} onOpenChange={(e) => { setPopupOpen(e) }}>
            <DialogTrigger className="invisible" id="upload-file">
                Upload File
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload a file to Arweave</DialogTitle>
                    <DialogDescription>
                        Uploading a file to Arweave will make it immutable and permanent. Drag and drop the file you want to upload.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="w-full bg-muted/20 text-black">
                        <TabsTrigger value="upload" className="w-full data-[state=active]:bg-primary data-[state=active]:text-white">Upload</TabsTrigger>
                        <TabsTrigger value="history" className="w-full data-[state=active]:bg-primary data-[state=active]:text-white">History</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                        <input id="upload-to-ar" type="file" accept="*" placeholder="Upload File" hidden onChange={handleFileDrop} />
                        <label htmlFor="upload-to-ar" className="text-center" onDragOver={handleFileDragOver} onDrop={handleFileDrop} onDragLeave={() => setFileDragOver(false)}>
                            <div data-draggedover={fileDragOver} className="flex flex-col border border-dashed data-[draggedover=true]:border-primary rounded-lg p-4 text-sm">
                                {file ? file.name : "Drag a file"}
                                {file && <Button variant="link" className="text-muted-foreground p-0 h-5 mt-1" onClick={(e) => {
                                    e.preventDefault()
                                    // reset input
                                    setFile(null); setPrice(null);
                                }}>clear</Button>}
                            </div>
                        </label>
                        {price && <div className="text-left text-xs text-muted-foreground mt-1">Estimated cost: {price} AR</div>}
                        <Button disabled={uploading} onClick={() => upload()} className="mt-4">Upload {uploading && <Loader size={18} className="ml-2 animate-spin" />}</Button>
                    </TabsContent>
                    <TabsContent value="history" className="grid grid-cols-3 gap-y-2 items-center justify-center max-h-[300px] overflow-scroll">
                        {/* {
                            JSON.stringify(history, null, 2)
                        } */}
                        {
                            history.length > 0 && history.map((txn, _) => {
                                const fileName = txn.tags?.find((tag: Tag) => tag.name === "File-Name")?.value

                                return <>
                                    {fileName || <span className="text-muted">unnamed</span>}
                                    <Link href={`https://arweave.net/${txn.id}`} target="_blank" className="text-xs hover:underline col-span-2 truncate">{txn.id}</Link>
                                </>
                            })
                        }
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
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
import { Loader, Upload as UploadIcon, X, FileText, CheckCircle2 } from "lucide-react";
import { GraphQLClient, gql } from "graphql-request";
import Link from "next/link";
import { useWallet, ConnectionStrategies } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

type Transaction = {
    id: string;
    tags: Tag[];
    timestamp?: number;
}

type UploadState = {
    file: File | null;
    price: string | null;
    status: 'idle' | 'uploading' | 'success' | 'error';
    error: string | null;
}

export default function Upload() {
    const { connected, address, actions } = useWallet()
    const [popupOpen, setPopupOpen] = useState(false);
    const [fileDragOver, setFileDragOver] = useState(false);
    const [uploadState, setUploadState] = useState<UploadState>({
        file: null,
        price: null,
        status: 'idle',
        error: null
    });
    const [history, setHistory] = useLocalStorage<Transaction[]>("upload-history", [], { initializeWithValue: true });
    const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");

    const ar = new Arweave({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
    });

    async function upload() {
        if (!uploadState.file) return;

        setUploadState(prev => ({ ...prev, status: 'uploading', error: null }));

        try {
            const txn = await ar.createTransaction({
                data: new Uint8Array(await uploadState.file.arrayBuffer())
            }, "use_wallet");

            txn.addTag("Content-Type", uploadState.file.type || "application/octet-stream");
            txn.addTag("App-Name", "BetterIDEa");
            txn.addTag("App-Version", AppVersion);
            txn.addTag("BetterIDEa-Function", "Upload-Utility");
            txn.addTag("File-Name", uploadState.file.name || "unknown");

            await ar.transactions.sign(txn, "use_wallet");
            await ar.transactions.post(txn);

            // Clear the file and price after successful upload
            setUploadState({
                file: null,
                price: null,
                status: 'success',
                error: null
            });

            // Reset the file input
            (document.getElementById('upload-to-ar') as HTMLInputElement).value = '';

            setHistory(prev => [...prev, {
                id: txn.id,
                tags: txn.tags,
                timestamp: Date.now()
            }]);

            toast.success("File uploaded successfully!", {
                description: `Transaction ID: ${txn.id}`,
                action: {
                    label: "View",
                    onClick: () => window.open(`https://arweave.net/${txn.id}`, '_blank')
                }
            });
        } catch (e) {
            const error = e instanceof Error ? e.message : 'Failed to upload file';
            setUploadState(prev => ({ ...prev, status: 'error', error }));
            toast.error("Upload failed", { description: error });
        }
    }

    async function handleFileDrop(e: React.DragEvent<HTMLLabelElement> | React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        setFileDragOver(false);

        let files: FileList | null = null;
        if ('dataTransfer' in e) {
            files = e.dataTransfer.files;
        } else {
            files = e.target.files;
        }

        if (!files || files.length === 0) {
            toast.error("No files selected");
            return;
        }

        const file = files[0];
        setUploadState(prev => ({ ...prev, file }));

        try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const price = ar.ar.winstonToAr(await ar.transactions.getPrice(bytes.byteLength, address));
            setUploadState(prev => ({ ...prev, price }));
        } catch (e) {
            const error = e instanceof Error ? e.message : 'Failed to calculate price';
            setUploadState(prev => ({ ...prev, error }));
            toast.error("Error calculating price", { description: error });
        }
    }

    function handleFileDragOver(e: React.DragEvent<HTMLLabelElement>) {
        e.preventDefault();
        setFileDragOver(true);
    }

    async function getUploadHistory() {
        if (!connected || !address) return;

        try {
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
                                name: "BetterIDEa-Function",
                                values: ["Upload-Utility"]
                            }
                        ]
                    ) {
                        edges {
                            node {
                                id,
                                tags {
                                    name,
                                    value
                                },
                                block {
                                    timestamp
                                }
                            }
                        }
                    }
                }
            `;

            const client = new GraphQLClient("https://arnode.asia/graphql");
            const { transactions: { edges } } = await client.request(query) as any;

            setHistory(edges.map((e: any) => ({
                id: e.node.id,
                tags: e.node.tags,
                timestamp: e.node.block?.timestamp
            })));
        } catch (e) {
            console.error("Failed to fetch history:", e);
            toast.error("Failed to load upload history");
        }
    }

    useEffect(() => {
        getUploadHistory();
    }, [connected, address]);

    return (
        <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
            <DialogTrigger className="invisible" id="upload-file">
                Upload File
            </DialogTrigger>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>Upload a file to Arweave</DialogTitle>
                    <DialogDescription>
                        Uploading a file to Arweave will make it immutable and permanent.
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    defaultValue="upload"
                    value={activeTab}
                    onValueChange={(value: "upload" | "history") => {
                        setActiveTab(value);
                        if (value === "history") {
                            getUploadHistory();
                        }
                    }}
                    className="w-full"
                >
                    <TabsList className="w-full bg-muted/20 text-black">
                        <TabsTrigger value="upload" className="w-full data-[state=active]:bg-primary text-foreground">
                            Upload
                        </TabsTrigger>
                        <TabsTrigger value="history" className="w-full data-[state=active]:bg-primary text-foreground">
                            History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4">
                        <input
                            id="upload-to-ar"
                            type="file"
                            accept="*"
                            hidden
                            onChange={handleFileDrop}
                        />

                        <label
                            htmlFor="upload-to-ar"
                            className={cn(
                                "block cursor-pointer transition-colors",
                                !fileDragOver && "hover:bg-muted/50"
                            )}
                            onDragOver={handleFileDragOver}
                            onDrop={handleFileDrop}
                            onDragLeave={() => setFileDragOver(false)}
                        >
                            <div
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg",
                                    fileDragOver ? "border-primary bg-primary/5" : "border-muted",
                                    uploadState.file && "border-primary"
                                )}
                            >
                                {uploadState.file ? (
                                    <>
                                        <FileText className="h-8 w-8 text-primary" />
                                        <span className="font-medium">{uploadState.file.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon className="h-8 w-8 text-muted-foreground" />
                                        <span className="font-medium">Drag and drop or click to upload</span>
                                        <span className="text-sm text-muted-foreground">
                                            Any file type supported
                                        </span>
                                    </>
                                )}
                            </div>
                        </label>

                        {uploadState.file && (
                            <div className="flex items-center justify-between">
                                {uploadState.price && (
                                    <span className="text-sm text-muted-foreground">
                                        Estimated cost: {uploadState.price} AR
                                    </span>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setUploadState({ file: null, price: null, status: 'idle', error: null });
                                        (document.getElementById('upload-to-ar') as HTMLInputElement).value = '';
                                    }}
                                >
                                    Clear
                                    <X className="h-4 w-4 ml-2" />
                                </Button>

                            </div>
                        )}

                        <Button
                            className="w-full"
                            disabled={!uploadState.file || uploadState.status === 'uploading'}
                            onClick={upload}
                        >
                            {uploadState.status === 'uploading' ? (
                                <>
                                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : uploadState.status === 'success' ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Uploaded
                                </>
                            ) : (
                                'Upload'
                            )}
                        </Button>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {history.length === 0 ? (
                                <div className="text-center text-muted-foreground py-4">
                                    No upload history found
                                </div>
                            ) : (
                                history.map((txn) => {
                                    const fileName = txn.tags?.find(tag => tag.name === "File-Name")?.value;
                                    const timestamp = txn.timestamp ? new Date(txn.timestamp * 1000).toLocaleString() : 'Unknown date';

                                    return (
                                        <div
                                            key={txn.id}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    {fileName || 'Unnamed file'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {timestamp}
                                                </div>
                                            </div>
                                            <Link
                                                href={`https://arweave.net/${txn.id}`}
                                                target="_blank"
                                                className="text-xs text-primary hover:underline ml-2"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
import { Button } from "@/components/ui/button";
import { useGlobalState, useProfile, useProjectManager } from "@/hooks";
import { PFile } from "@/hooks/useProjectManager";
import { AppVersion, BAZAR, BAZAR_TAGS, runLua, spawnProcess, Tag } from "@/lib/ao-vars";
import { cleanProcessField } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Arweave from "arweave";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { extractHandlerNames } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FileCode, LoaderIcon, SquareFunction } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type TemplateAsset = {
    name: string;
    description: string;
    files: PFile[];
}

export default function PublishTemplateBtn() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const profile = useProfile()
    const [tname, setTname] = useState("")
    const [tdescription, setTdescription] = useState("")
    const [tquantity, setTquantity] = useState<number>(1)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [license, setLicense] = useState<string | null>(null)

    const project = globalState.activeProject && manager.getProject(globalState.activeProject)
    const files = project && project.files
    const [selectedFiles, setSelectedFiles] = useState<string[]>(Object.keys(files || {}))

    async function publishTemplateHandler() {
        if (!globalState.activeProject) return toast.error("No active project")
        const project = manager.getProject(globalState.activeProject);
        if (!project) return toast.error("No active project")
        if (!profile.id) return toast.error("Profile not found, create on on ao-bazar or try again later")

        if (!tname) return toast.error("Template must have a name")
        if (!tdescription) return toast.error("Template must have a description")
        if (!tquantity) return toast.error("Template must have a quantity")
        if (tquantity < 1) return toast.error("Quantity must be greater than 0")

        const arweave = Arweave.init({
            host: "arweave.net",
            port: 443,
            protocol: "https"
        })

        //strip process ids from project.files
        const templateFiles = Object.values(project.files).map((file) => {
            if (selectedFiles.includes(file.name))
                return {
                    name: file.name,
                    content: file.content,
                    language: file.language,
                    type: file.type,
                }
        })

        if (templateFiles.length === 0) return toast.error("Project must have at least one file to publish as a template")

        const contentType = "application/json"
        const transferableTokens = true
        const dateTime = new Date().getTime().toString();

        setLoading(true)

        const processSrcFetch = await fetch(`https://arweave.net/${BAZAR.assetSrc}`)
        if (processSrcFetch.ok) {

            let processSrc = await processSrcFetch.text()
            const res = await arweave.createTransaction({ data: JSON.stringify(templateFiles) }, "use_wallet")
            res.addTag("Content-Type", "application/json")
            res.addTag("App-Name", "BetterIDEa")
            res.addTag("App-Version", AppVersion)
            await arweave.transactions.sign(res)
            const res1 = await arweave.transactions.post(res)
            if (res1.status == 200) {
                console.log("files txn", res.id);

                const assetTags: Tag[] = [
                    { name: "BetterIDEa-Template", value: "BetterIDEa-Template" },
                    { name: "Template-Files", value: res.id },
                    { name: BAZAR_TAGS.keys.contentType, value: contentType },
                    { name: BAZAR_TAGS.keys.creator, value: profile.id },
                    { name: BAZAR_TAGS.keys.ans110.title, value: tname },
                    { name: BAZAR_TAGS.keys.ans110.description, value: tdescription },
                    { name: BAZAR_TAGS.keys.ans110.type, value: contentType },
                    { name: BAZAR_TAGS.keys.ans110.implements, value: BAZAR_TAGS.values.ansVersion },
                    { name: BAZAR_TAGS.keys.dateCreated, value: dateTime },
                    { name: 'Action', value: 'Add-Uploaded-Asset' },
                    { name: BAZAR_TAGS.keys.renderWith, value: 'betteridea' },
                ];

                if (processSrc) {
                    processSrc = processSrc.replace('[Owner]', `['${profile.id}']`);
                    processSrc = processSrc.replaceAll(`'<NAME>'`, cleanProcessField(tname));
                    processSrc = processSrc.replaceAll('<TICKER>', 'ATOMIC');
                    processSrc = processSrc.replaceAll('<DENOMINATION>', '1');
                    processSrc = processSrc.replaceAll('<BALANCE>', tquantity.toString());
                }

                if (!transferableTokens) {
                    processSrc = processSrc.replace('Transferable = true', 'Transferable = false');
                }

                console.log(processSrc);

                const processId = await spawnProcess(tname, assetTags)

                if (processId) {
                    console.log("asset id: ", processId);
                    const maxTries = 30;
                    let tries = 0;
                    while (tries < maxTries) {
                        try {
                            const srcLoadRes = await runLua(processSrc, processId)
                            console.log(srcLoadRes)
                            if (srcLoadRes) {
                                break;
                            }
                        } catch {
                            tries++;
                            await new Promise((resolve) => setTimeout(resolve, 2000));
                        }
                    }
                }

                // add asset to profile
                const data = JSON.stringify({
                    Id: processId,
                    Quantity: tquantity
                })
                console.log("adding asset to profile", data)
                console.log("profile id", profile.id)
                const addProfileRes = await runLua(data, processId, [
                    { name: 'Action', value: 'Add-Asset-To-Profile' },
                    { name: 'ProfileProcess', value: profile.id },
                    { name: 'Quantity', value: tquantity.toString() },
                ])
                console.log(addProfileRes)
                if (addProfileRes.Error) {
                    console.log("Error adding asset to profile\n" + addProfileRes.Error)
                } else {
                    console.log("no errors")
                }
                toast.success("Template published successfully")
                setOpen(false)
            }
        }
        setLoading(false)
    }

    //     return <Button variant="ghost" className="text-xs p-2 invisible" id="publish-template" onClick={publishTemplateHandler}>
    //         publish Template
    //     </Button>

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger id="publish-template">Open</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Publish your project as a template</DialogTitle>
                <DialogDescription>
                    This will publish your project as an atomic asset on the bazar marketplace
                </DialogDescription>
            </DialogHeader>
            <Label htmlFor="name" className="px-2 text-lg -mb-3">Name</Label>
            <Input id="name" placeholder="Enter a title for your template" onChange={(e) => setTname(e.target.value)} />
            <Label htmlFor="description" className="px-2 text-lg -mb-3">Short Description</Label>
            <Textarea id="description" placeholder="Enter a description for your template" onChange={(e) => setTdescription(e.target.value)} />
            <div className="grid grid-cols-2">
                <div>
                    <Label htmlFor="quantity" className="px-2 text-lg">Select Files</Label>
                    <Label htmlFor="select-all" className="inline-flex gap-1 items-center ml-2 text-muted-foreground">[ All<Checkbox
                        id="select-all"
                        className="scale-75 m-0 p-0"
                        defaultChecked
                        checked={selectedFiles.length === Object.keys(files || {}).length}
                        onCheckedChange={(e) => {
                            if (e) {
                                setSelectedFiles(Object.keys(files))
                            } else {
                                setSelectedFiles([])
                            }
                        }} />]</Label>
                    {
                        files && Object.keys(files).map((fname) => {
                            const file = files[fname]
                            return <div key={fname} className="flex items-center gap-2 my-1 ml-3">
                                <Checkbox id={fname} defaultChecked checked={selectedFiles.includes(fname)} onCheckedChange={(e) => {
                                    if (e) {
                                        setSelectedFiles([...selectedFiles, fname])
                                    } else {
                                        setSelectedFiles(selectedFiles.filter((f) => f !== fname))
                                    }
                                }} />
                                <Label htmlFor={fname} data-selected={selectedFiles.includes(file.name)} className="text-muted data-[selected=true]:text-muted-foreground">{file.name}</Label>
                            </div>
                        })
                    }

                </div>
                <div>
                    <Label htmlFor="quantity" className="px-2 text-lg">Number of copies</Label>
                    <Input id="quantity" placeholder="Enter the number of copies you want to mint" type="number" min={1} defaultValue={1} onChange={(e) => setTquantity(parseInt(e.target.value))} />
                </div>

            </div>
            <div>
                <Label htmlFor="license" className="px-2 text-lg">Licensing <span className="text-sm text-muted-foreground">(coming soon)</span></Label>
                <Select disabled onValueChange={v => setLicense(v)}>
                    <SelectTrigger className="">
                        <SelectValue placeholder="Select a License" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="none">Unlicensed</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Universal Data License</SelectLabel>
                            <SelectItem value="com-dev">Commercial Use + Derivations</SelectItem>
                            <SelectItem value="non-com-dev">Non-Commercial Use + Derivations</SelectItem>
                            <SelectItem value="non-com-non-dev">Non-Commercial Use + No Derivations</SelectItem>
                        </SelectGroup>
                        {/* <SelectGroup>
                            <SelectLabel>OSS License</SelectLabel>
                            <SelectItem value="mit">MIT</SelectItem>
                            <SelectItem value="apache">Apache</SelectItem>
                            <SelectItem value="gpl">GPL</SelectItem>
                        </SelectGroup> */}
                    </SelectContent>
                </Select>

            </div>

            <div className="flex gap-4 px-2">
                <div className="flex gap-1 items-center">{`${files && Object.keys(files).length} Files`}<FileCode size={20} /></div>
                <div className="flex gap-1 items-center">{
                    `${files &&
                    extractHandlerNames(Object.values(files).map((file) => {
                        if (file.type === "NORMAL") {
                            return file.content.cells[0].code;
                        } else {
                            return file.content.cellOrder.map((cellId) => {
                                return file.content.cells[cellId].code;
                            }).join("\n");
                        }
                    }).join("\n")).length} Handlers`
                }<SquareFunction size={20} /></div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="secondary">Cancel</Button>
                <Button disabled={loading} className="p-2 w-fit" onClick={publishTemplateHandler}>
                    Publish Template {loading && <LoaderIcon size={20} className="animate-spin ml-1" />}
                </Button>

            </div>
        </DialogContent>
    </Dialog>


}
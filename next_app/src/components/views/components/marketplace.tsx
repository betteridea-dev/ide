import { Input } from "@/components/ui/input";
import { TView } from "."
import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleUserRound, Files, Search, SquareFunction } from "lucide-react";
import { useGlobalState } from "@/hooks";
import WarpedAR from "@/components/ui/icons/war";
import Link from "next/link";
import BazarIcon from "@/components/ui/icons/bazar";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { gql, GraphQLClient } from "graphql-request";
import { toast } from "sonner";
import { TemplateAsset } from "@/components/menubar/components/publish-template";
import { Tag } from "@/lib/ao-vars";
import { extractHandlerNames } from "@/lib/utils";
import { AOProfileType, getProfileById } from "@/lib/bazar";
import Image from "next/image";

function Template({ pid }: { pid: string }) {
    const [hovered, setHovered] = useState(false)
    const [txData, setTxData] = useState<TemplateAsset & { creator: string }>(null)
    const [assetTags, setAssetTags] = useState<{ [name: string]: string }>({
        'Title': "",
        'Description': "",
        'Creator': "",
        'Template-Files': ""
    })
    const [fileCount, setFileCount] = useState(0)
    const [handlerCount, setHandlerCount] = useState(0)
    const [profile, setProfile] = useState<AOProfileType>({
        id: null,
        walletAddress: null,
        displayName: null,
        username: null,
        bio: null,
        avatar: null,
        banner: null,
        version: null,
    })

    useEffect(() => {
        if (!pid) return

        const gqlQuery = gql`query {
  transactions(
			ids:["${pid}"]
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
            setAssetTags(tags)
            const filesTxId = tags["Template-Files"]

            console.log("fetching tx data", filesTxId)
            fetch(`https://arweave.net/${filesTxId}`)
                .then(res => res.json())
                .then((res) => {
                    console.log(res)
                    setTxData({
                        name: tags['Title'],
                        description: tags['Description'],
                        creator: tags['Creator'],
                        files: res
                    })
                })
        }).catch((e) => {
            console.error(e)
            toast.error("Error fetching transaction data")
        })
    }, [pid])

    useEffect(() => {
        if (!txData) return

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

    }, [txData])

    useEffect(() => {
        console.log("assetTags", assetTags)
        const creator = assetTags['Creator']
        if (!creator) return

        getProfileById({ profileId: creator }).then((profile) => {
            console.log("profile", profile)
            setProfile(profile)
        })
    }, [assetTags])

    function handleMouseEnter() {
        setHovered(true)
    }

    function handleMouseLeave() {
        setHovered(false)
    }

    function handleClick(e: React.MouseEvent) {
        console.log("clicked")
    }

    return <Dialog>
        <DialogTrigger asChild>
            <div data-hovered={hovered}
                className="p-5 border rounded transition-all duration-200 cursor-pointer data-[hovered=true]:bg-muted/15"
                onMouseMove={handleMouseEnter} onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >

                <div className="grid grid-cols-5 items-start justify-between mb-5">
                    <div className="flex flex-col col-span-3">
                        <div className="text-lg font-semibold">{assetTags['Title']}</div>
                        <div className="text-sm text-gray-500">{assetTags['Description']}</div>
                    </div>
                    <div data-hovered={hovered} className="text-sm transition-all duration-200 col-span-2 flex flex-col gap-1.5 justify-start items-end text-muted-foreground">
                        <div className="flex items-center gap-1">{fileCount || "NA"} Files <Files size={18} className="inline-block" /></div>
                        <div className="flex items-center gap-1">{handlerCount || "NA"} Handlers <SquareFunction size={18} className="inline-block" /></div>
                    </div>

                </div>
                <div data-hovered={hovered} className="flex text-sm gap-5 items-center transition-all duration-200">
                    <Link href={`https://ao-bazar.arweave.net/#/profile/${profile ? profile.id : "#"}`} target="_blank" className="font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1"
                        onClick={(e) => { e.stopPropagation() }}
                    >
                        {profile?.avatar ? <Image src={`https://arweave.net/${profile.avatar}`} width={22} height={22} alt="profile-picture" className="rounded-full" /> : <CircleUserRound size={18} />}
                        {profile.displayName || profile.username}</Link>
                    <div className="grow"></div>
                    {/* <div className="flex gap-2 items-center font-semibold">$0.1 <WarpedAR /></div> */}
                    <Link href={`https://ao-bazar.arweave.net/#/asset/${pid}`} target="_blank" className="text-primary hover:underline underline-offset-4 flex items-center gap-1.5"
                        onClick={(e) => { e.stopPropagation() }}
                    >View on bazar <BazarIcon /></Link>
                    {/* <Label data-hovered={hovered} className="ml-auto text-sm text-muted/30 transition-all duration-200 opacity-0 data-[hovered=true]:opacity-100 cursor-pointer">click to preview</Label> */}
                </div>

            </div>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] h-full min-w-[80vw] flex flex-col">
            <DialogHeader>
                <DialogTitle>Llama world: AI agent</DialogTitle>
                <DialogDescription>
                    Useful template to create agents. asdjadhjasdjh  asjhdjasdj  jhasdhjajhdajhd hdhadguwfiwbfib bsa bhabsfha fh
                </DialogDescription>
            </DialogHeader>
            <iframe src={`/renderer?tx=${pid}`} className="border w-full grow rounded"></iframe>
            <DialogFooter className="flex items-center !justify-between">
                {/* view on bazar */}
                <Link href={`https://ao-bazar.arweave.net/#/asset/${pid}`} target="_blank" className="text-primary hover:underline underline-offset-4 flex items-center gap-1.5"
                    onClick={(e) => { e.stopPropagation() }}
                ><BazarIcon /> View on bazar</Link>
                <Button type="submit">Import Into current project</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function Marketplace() {
    const globalState = useGlobalState();

    return <div className="p-10 overflow-scroll max-h-[calc(100vh-55px)]">
        <Button variant="link" className="mb-5 text-sm text-muted p-0" onClick={() => {
            globalState.setActiveView(null)
            globalState.setActiveSidebarItem(null)
        }}>
            <ArrowLeft size={15} className=" inline-block mr-2" /> home
        </Button>
        <div className="text-2xl">Template Marketplace</div>
        <div className="relative my-8">
            <Input placeholder="Search" className="pl-8" />
            <Search className="absolute top-1/2 left-2 transform -translate-y-1/2" size={18} />
        </div>

        <div className="grid lg:grid-cols-2 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <Template key={i} pid={"YWkoL2_Myf2r05dYUzGJNIMSd3leAYwTpvSaU6E8zQQ"} />)}
        </div>

    </div>
}

const viewItem: TView = {
    component: Marketplace,
    label: "Template Marketplace",
    value: "MARKETPLACE" // udpate this and add to the list in ./index.ts
}

export default viewItem;
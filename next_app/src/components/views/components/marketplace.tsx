import { Input } from "@/components/ui/input";
import { TView } from "."
import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleUserRound, Files, Loader, LoaderIcon, Search, SquareFunction } from "lucide-react";
import { useGlobalState, useProjectManager } from "@/hooks";
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
import { useLocalStorage, useSessionStorage } from "usehooks-ts";

const featured = [
    "LqpX1NRyjyx5gzzY4Fx-VqjjyOHCBl80Bf2-_uoZybM",
]

function Template({ pid, search }: { pid: string, search: string }) {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [open, setOpen] = useState(false)
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
    const [loading, setLoading] = useState(false)

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
        setLoading(true)
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
        }).finally(() => {
            setLoading(false)
        })
    }, [pid])

    useEffect(() => {
        if (!txData) return

        const fileNames = Object.keys(txData.files);
        const sourceSummed = fileNames.map(fileName => {
            const file = txData.files[fileName];
            if (!file) return "";
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

    const search_ = search.trim().toLowerCase()

    // if (assetTags['Title'].toLowerCase().includes(search.toLowerCase())
    //     || assetTags['Description'].toLowerCase().includes(search.toLowerCase())
    //     || pid.toLowerCase().includes(search.toLowerCase())
    //     || profile?.displayName.toLowerCase().includes(search.toLowerCase())

    // )

    function compare(lhs: string, rhs: string) {
        if (!lhs || !rhs) return false
        return lhs.trim().toLowerCase().includes(rhs.trim().toLowerCase())
    }

    if (search_ && !(
        compare(assetTags['Title'], search_)
        || compare(assetTags['Description'], search_)
        || compare(pid, search_)
        || compare(profile?.displayName, search_)
        || compare(profile?.username, search_)
    )) {
        return null
    }

    function importIntoProj() {
        if (!globalState.activeProject) return toast.error("No active project")
        const proj = manager.getProject(globalState.activeProject)
        if (!proj) return toast.error("Project not found")
        if (!txData) return toast.error("No transaction data, try again")

        txData.files.forEach((file) => {
            // if (proj.files[file.name])
            //     file.name = file.name + " (1)"
            let count = 0;
            while (proj.files[file.name]) {
                count++;
                file.name = file.name.replace(/\s\(\d+\)/, "") + ` (${count})`;
            }
            if (file.type == "NORMAL") {
                manager.newFile(proj, {
                    name: file.name,
                    initialContent: file.content.cells[0].code,
                    type: file.type
                })
            } else {
                const newfile = manager.newFile(proj, {
                    name: file.name,
                    initialContent: "",
                    type: file.type
                })
                newfile.content = file.content;
                proj.files[newfile.name] = newfile;
                manager.projects[proj.name] = proj;
                manager.saveProjects(manager.projects);
            }
        })

        toast.success("Imported into active project")
        globalState.setActiveSidebarItem("FILES")
        setOpen(false)
    }

    if (parseInt(assetTags['Date-Created']) <= 1725350215227) return null

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild disabled={loading}>
            <div data-hovered={hovered}
                className="p-5 border relative rounded transition-all duration-200 cursor-pointer data-[hovered=true]:bg-primary/10"
                onMouseMove={handleMouseEnter} onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {loading && <LoaderIcon className="animate-spin absolute bg-background rounded-full p-1 left-1 top-1" />}
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
                    <Link href={`https://bazar.ar.io/#/profile/${profile ? profile.id : "#"}`} target="_blank" className="font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1"
                        onClick={(e) => { e.stopPropagation() }}
                    >
                        {profile?.avatar ? <Image src={`https://arweave.net/${profile.avatar}`} width={22} height={22} alt="profile-picture" className="rounded-full" /> : <CircleUserRound size={18} />}
                        {profile.displayName || profile.username}</Link>
                    <div className="grow"></div>
                    {/* <div className="flex gap-2 items-center font-semibold">$0.1 <WarpedAR /></div> */}
                    <Link href={`https://bazar.ar.io/#/asset/${pid}`} target="_blank" className="text-primary hover:underline underline-offset-4 flex items-center gap-1.5"
                        onClick={(e) => { e.stopPropagation() }}
                    >View on bazar <BazarIcon /></Link>
                    {/* <Label data-hovered={hovered} className="ml-auto text-sm text-muted/30 transition-all duration-200 opacity-0 data-[hovered=true]:opacity-100 cursor-pointer">click to preview</Label> */}
                </div>

            </div>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] h-full min-w-[80vw] flex flex-col">
            <iframe src={`/renderer?tx=${pid}`} className="border w-full grow rounded"></iframe>
            <DialogFooter className="flex items-center !justify-between">
                {/* view on bazar */}
                <Link href={`https://bazar.ar.io/#/asset/${pid}`} target="_blank" className="text-primary hover:underline underline-offset-4 flex items-center gap-1.5"
                    onClick={(e) => { e.stopPropagation() }}
                ><BazarIcon /> View on bazar</Link>
                <Button disabled={!globalState.activeProject} type="submit" onClick={importIntoProj}>Import Into current project</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

function Marketplace() {
    const globalState = useGlobalState();
    const [assetIds, setAssetIds] = useSessionStorage<string[]>("marketplace", [], { initializeWithValue: true })
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function refresh() {
            const gqlQuery = gql`query {
  transactions(
		tags:[{
      name:"BetterIDEa-Template",
      values:["BetterIDEa-Template"]
    }]
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
}`

            setLoading(true)
            const client = new GraphQLClient("https://arweave.net/graphql")
            client.request(gqlQuery).then((data) => {
                const node = (data as any).transactions.edges.map((edge) => edge.node)
                const ids = node.map((n) => n.id)
                console.log(ids)
                setAssetIds(ids)
            }).catch((e) => {
                console.error(e)
                toast.error("Error fetching transaction data")
            })
            setLoading(false)
        }
        refresh()
    }, [])

    useEffect(() => {
        function fetchAssets() {
            if (!search && assetIds.length > 0) return

            const gqlQuery = gql`query {
  transactions(
		tags:[{
      name:"BetterIDEa-Template",
      values:["BetterIDEa-Template"]
    }]
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
}`
            setLoading(true)
            const client = new GraphQLClient("https://arweave.net/graphql")
            client.request(gqlQuery).then((data) => {
                const node = (data as any).transactions.edges.map((edge) => edge.node)
                const ids = node.map((n) => n.id)
                console.log(ids)
                setAssetIds(ids)
            }).catch((e) => {
                console.error(e)
                toast.error("Error fetching transaction data")
            })
            setLoading(false)
        }
        const t = setTimeout(fetchAssets, 500)

        return () => clearTimeout(t)
    }, [search])

    return <div className="p-10 overflow-scroll max-h-[calc(100vh-55px)]">
        <Button variant="link" className="mb-5 text-sm text-muted p-0" onClick={() => {
            globalState.setActiveView(null)
            globalState.setActiveSidebarItem(null)
        }}>
            <ArrowLeft size={15} className="inline-block mr-2" /> home
        </Button>
        <div className="text-2xl">Template Marketplace (BETA)</div>
        <div className="relative my-8">
            <Input placeholder="Search by name / asset id / description / username" className="pl-8" onChange={e => {
                const v = e.target.value
                if (v.length == 43) {
                    setAssetIds([v])
                    setSearch("")
                }
                else
                    setSearch(e.target.value)
            }} />
            <Search className="absolute top-1/2 left-2 transform -translate-y-1/2" size={18} />
        </div>

        <details open className="mb-10 text-muted open:text-foreground">
            <summary className="mb-3 -ml-6 text-xl cursor-pointer"><span className="ml-2">Featured Templates</span></summary>
            <div className="grid lg:grid-cols-2 gap-3">
                {
                    featured.map((pid) => <Template key={pid} pid={pid} search={search} />)
                }
            </div>
            <hr className="mt-10" />
        </details>

        <div className="grid lg:grid-cols-2 gap-3">
            {/* {Array.from({ length: 10 }).map((_, i) => <Template key={i} pid={"YWkoL2_Myf2r05dYUzGJNIMSd3leAYwTpvSaU6E8zQQ"} />)} */}
            {loading && <div className="text-center col-span-2 flex items-center justify-center"><LoaderIcon className="animate-spin" /></div>}
            {
                assetIds
                    .filter((pid) => !featured.includes(pid))
                    .map((pid) => <Template key={pid} pid={pid} search={search} />)
            }
        </div>

    </div>
}

const viewItem: TView = {
    component: Marketplace,
    label: "Template Marketplace",
    value: "MARKETPLACE" // udpate this and add to the list in ./index.ts
}

export default viewItem;
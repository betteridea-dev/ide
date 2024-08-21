import { Input } from "@/components/ui/input";
import { TView } from "."
import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleUserRound, Files, Search, SquareFunction } from "lucide-react";
import { useGlobalState } from "@/hooks";
import WarpedAR from "@/components/ui/icons/war";
import Link from "next/link";
import BazarIcon from "@/components/ui/icons/bazar";
import { useState } from "react";
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

function Template({ pid }: { pid: string }) {
    const [hovered, setHovered] = useState(false)

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
                        <div className="text-lg font-semibold">Llama world: AI agent</div>
                        <div className="text-sm text-gray-500">Useful template to create agents. asdjadhjasdjh  asjhdjasdj  jhasdhjajhdajhd hdhadguwfiwbfib bsa bhabsfha fh</div>
                    </div>
                    <div data-hovered={hovered} className="text-sm transition-all duration-200 col-span-2 flex flex-col gap-1.5 justify-start items-end text-muted-foreground">
                        <div className="flex items-center gap-1">5 Files <Files size={18} className="inline-block" /></div>
                        <div className="flex items-center gap-1">10 Handlers <SquareFunction size={18} className="inline-block" /></div>
                    </div>

                </div>
                <div data-hovered={hovered} className="flex text-sm gap-5 items-center transition-all duration-200">
                    <div className="flex items-center gap-1"><CircleUserRound size={18} /> <Link href={`https://ao-bazar.arweave.net/#profile/${"#"}`} target="_blank" className="font-semibold text-primary hover:underline underline-offset-4"
                        onClick={(e) => { e.stopPropagation() }}
                    >ankushKun</Link></div>
                    <div className="grow"></div>
                    <div className="flex gap-2 items-center font-semibold">$0.1 <WarpedAR /></div>
                    <Link href={`https://ao-bazar.arweave.net/#/asset/${pid}`} target="_blank" className="text-primary hover:underline underline-offset-4 flex items-center gap-1.5"
                        onClick={(e) => { e.stopPropagation() }}
                    >View on bazar <BazarIcon /></Link>
                    {/* <Label data-hovered={hovered} className="ml-auto text-sm text-muted/30 transition-all duration-200 opacity-0 data-[hovered=true]:opacity-100 cursor-pointer">click to preview</Label> */}
                </div>

            </div>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>Llama world: AI agent</DialogTitle>
                <DialogDescription>
                    Useful template to create agents. asdjadhjasdjh  asjhdjasdj  jhasdhjajhdajhd hdhadguwfiwbfib bsa bhabsfha fh
                </DialogDescription>
            </DialogHeader>
            <iframe src={`/renderer?tx=${pid}`} className="border aspect-square w-full rounded"></iframe>
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
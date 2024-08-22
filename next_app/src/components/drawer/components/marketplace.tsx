import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

function TemplateMarketplace() {
    return <div className="max-h-[calc(100vh-50px)]">
        <h1 className="text-left p-3 text-muted-foreground">TEMPLATE MARKETPLACE</h1>
        <div className="whitespace-normal text-sm text-muted-foreground m-2 text-justify">
            <div>Here you can find a variety of user submitted templates to help you get started with your projects quickly.</div>
            <br />
            <div>
                Every Template is a {" "}
                <Link href="https://cookbook.arweave.net/concepts/atomic-tokens.html" target="_blank" className="text-primary hover:underline underline-offset-2">Atomic Asset</Link>
                {" "} on the <Link href="https://ao-bazar.arweave.net/" target="_blank" className="text-primary hover:underline underline-offset-2">ao-bazar</Link> marketplace which anyone can buy and trade.
            </div>
            <br />
            <div>
                To publish your own template, simply use the <span className="text-primary inline-flex items-center">Project <ChevronRight className="inline p-0" size={15} /> Publish Template</span> option from the menu
            </div>
        </div>
    </div>
}

const drawerItem: TDrawerItem = {
    component: TemplateMarketplace,
    label: "Template Marketplace",
    value: "MARKETPLACE"
}

export default drawerItem;
import { Button } from "@/components/ui/button";
import { useGlobalState, useProjectManager } from "@/hooks";
import { PFile } from "@/hooks/useProjectManager";
import Arweave from "arweave";

export type BoilerplateAsset = {
    name: string;
    description: string;
    files: {
        [name: string]: PFile
    }
}

export default function PublishBoilerplateBtn() {
    const globalState = useGlobalState()
    const manager = useProjectManager()

    async function publishBoilerplateHandler() {
        if (!globalState.activeProject) return;
        const project = manager.getProject(globalState.activeProject);
        if (!project) return;

        const assetData: BoilerplateAsset = {
            name: project.name,
            description: "A boilerplate project",
            files: project.files
        }

        const arweave = Arweave.init({
            host: "arweave.net",
            port: 443,
            protocol: "https"
        })
        const res = await arweave.createTransaction({ data: JSON.stringify(assetData) }, "use_wallet")
        res.addTag("Content-Type", "application/json")
        res.addTag("App-Name", "BetterIDEa")
        await arweave.transactions.sign(res)
        const res1 = await arweave.transactions.post(res)
        if (res1.status == 200) {
            console.log(res.id);
        }

        console.log(assetData);
    }

    return <Button variant="ghost" className="text-xs p-2 invisible" id="publish-boilerplate" onClick={publishBoilerplateHandler}>
        publish boilerplate
    </Button>
}
import { GetStaticPropsContext } from "next";
import { dryrun } from "@permaweb/aoconnect"
import { useEffect, useState } from "react";
import { useProjectManager } from "@/hooks";
import { useRouter } from "next/router";
import Image from "next/image";
import Icons from "@/assets/icons";


export default function Import() {
    const projectManager = useProjectManager();
    const [data, setData] = useState(null)
    const router = useRouter()
    const { id } = router.query

    console.log(id)
    useEffect(() => {
        if (!id) return
        async function fetchShared() {
            const r = await dryrun({
                process: id as string,
                tags: [
                    { name: "Action", value: "Get-BetterIDEa-Share" },
                    { name: "BetterIDEa-Function", value: "Import-Shared" }
                ]
            })
            // console.log(r)
            console.log(decodeURIComponent(r.Messages[0].Data))
            setData(decodeURIComponent(r.Messages[0].Data))
            const data = JSON.parse(`${decodeURIComponent(r.Messages[0].Data)}`)
            console.log(data)
            try {
                await window.arweaveWallet.getActiveAddress()
            }
            catch (e) {
                await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"])
            }
            const ownerWallet = await window.arweaveWallet.getActiveAddress()
            data.ownerWallet = ownerWallet
            projectManager.newProject(data)
            window.location.href = "/?open=" + data.name
        }
        fetchShared()
    }, [id])

    // if (!id) return <div>loading...</div>
    return <div className="w-screen h-screen flex flex-col gap-1 items-center justify-center">
        <Image src={Icons.loadingSVG} alt="loading" width={50} height={50} className="animate-spin" />
        <div>Loading Project</div>
        <div className="text-sm text-btr-grey-1">You might need to connect your wallet</div>

        {!id && <div className="text-btr-grey-1">finding process id...</div>}
        {data && <div className="text-btr-grey-1">loading project...</div>}
        <pre className="text-xs text-btr-grey-1 p-2 absolute top-0 left-0 bottom-0 overflow-scroll">{JSON.stringify(JSON.parse(data), null, 2)}</pre>
    </div>
}
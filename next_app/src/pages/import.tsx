import { GetStaticPropsContext } from "next";
import { dryrun } from "@permaweb/aoconnect"
import { useEffect, useState } from "react";
import { useProjectManager } from "@/hooks";
import { useRouter } from "next/router";


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
            console.log(r.Messages[0].Data.replaceAll("\n", "\\n"))
            setData(r.Messages[0].Data.replaceAll("\n", "\\n"))
            const data = JSON.parse(`${r.Messages[0].Data.replaceAll("\n", "\\n")}`)
            console.log(data)
            const ownerWallet = await window.arweaveWallet.getActiveAddress()
            data.ownerWallet = ownerWallet
            projectManager.newProject(data)
            window.location.href = "/?open=" + data.name
        }
        fetchShared()
    }, [id])

    if (!id) return <div>loading...</div>
    return <pre>{data}</pre>
}
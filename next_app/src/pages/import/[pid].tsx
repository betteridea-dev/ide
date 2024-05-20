import { GetStaticPropsContext } from "next";
import { dryrun } from "@permaweb/aoconnect"
import { useEffect, useState } from "react";
import { useProjectManager } from "@/hooks";
import { redirect } from "next/navigation";

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: false,
    };
}

export async function getStaticProps(context: GetStaticPropsContext) {
    const processID = context.params?.pid as string;


    return {
        props: {
            pid: processID,
        },
    };
}

export default function Import({ pid }) {
    const projectManager = useProjectManager();
    const [data, setData] = useState(null)

    console.log(pid)
    useEffect(() => {
        if (!pid) return
        async function fetchShared() {
            const r = await dryrun({
                process: pid,
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
            window.location.href = "/"
        }
        fetchShared()
    }, [pid])

    if (!pid) return <div>loading...</div>
    return <pre>{data}</pre>
}
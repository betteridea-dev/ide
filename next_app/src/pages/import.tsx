import { GetServerSidePropsContext } from "next";
import { dryrun } from "@permaweb/aoconnect"
import { useEffect, useState } from "react";
import { useProjectManager } from "@/hooks";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from 'next/head';
import { LoaderIcon } from "lucide-react";
import { NextSeo } from "next-seo";
import { Project } from "@/hooks/useProjectManager";


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
            const data: Project = JSON.parse(`${decodeURIComponent(r.Messages[0].Data)}`)
            console.log(data)

            let owner = ""
            try {
                if (!window.arweaveWallet)
                    owner = ""
                else
                    owner = await window.arweaveWallet.getActiveAddress()
            }
            catch (e) {
                await window.arweaveWallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"])
                owner = await window.arweaveWallet.getActiveAddress()
            }
            data.ownerWallet = owner
            let sharedProjName = data.name
            let count = 0
            while (projectManager.projects[sharedProjName]) {
                if (count > 0) {
                    sharedProjName = data.name + ` (${count})`
                }
                count++
            }
            projectManager.newProject({ ...data, name: sharedProjName })
            setTimeout(() => {
                window.location.href = "/?open=" + sharedProjName
            }, 500)
        }
        fetchShared()
    }, [id])

    // if (!id) return <div>loading...</div>
    return <>
        {/* OG META TAGS */}
        {/* <Head>
        <meta name="og:title" content={`Import Shared Project - BetterIDEa`} />
            <meta name="og:description" content={`Welcome to the intuitive web IDE for building powerful actor oriented applications.
            
            Shared by process: ${id}`} />
        <meta name="og:url" content={`https://ide.betteridea.dev/import?id=${id}`} />
        </Head> */}

        <NextSeo
            title={`Import Shared Project - BetterIDEa`}
            description={`ao's development environment.
            
            Shared by process: ${id}`}
            openGraph={{
                title: `Import Shared Project - BetterIDEa`,
                description: `ao's development environment.
            
                Shared by process: ${id}`,
                url: `https://ide.betteridea.dev/import?id=${id}`,
                siteName: `BetterIDEa`,
                images: [
                    {
                        url: "https://ide.betteridea.dev/icon.svg",
                        type: "image/svg",
                        width: 100,
                        height: 100,
                    }
                ],
                type: "website"
            }}
            twitter={{ handle: "@betteridea_dev" }}
        />

        <div className="w-screen h-screen flex flex-col gap-1 items-center justify-center">
            {/* <Image src={Icons.loadingSVG} alt="loading" width={50} height={50} className="animate-spin z-10" /> */}
            <LoaderIcon size={50} className="animate-spin z-10" />
            <div>Loading Project</div>
            {/* <div className="text-sm text-btr-grey-1">You might need to connect your wallet</div> */}

            {!id && <div className="text-white z-10">finding process id...</div>}
            {data && <div className="text-white z-10">data loaded...</div>}
            <pre className="text-xs text-btr-grey-1 p-2 absolute top-0 left-0 bottom-0 overflow-scroll">{JSON.stringify(JSON.parse(data), null, 2)}</pre>
        </div>
    </>
}
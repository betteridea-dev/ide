import { useEffect, useState } from "react"

export type deployment = {
    "txid": string,
    "env": string
}

export type deploymentType = {
    [key: string]: deployment
}

export default function useDeployments() {
    const [deployments, setDeployments] = useState<deploymentType>(JSON.parse(localStorage.getItem("deployments")!) || {})

    useEffect(() => {
        if (deployments) localStorage.setItem("deployments", JSON.stringify(deployments))
    }, [deployments])

    function newDeployment(name: string, txid: string, env: string) {
        console.log("newDeployment", name, txid, env)
        const nc = {
            ...deployments,
            [name]: {
                "txid": txid,
                "env": env
            }
        }
        setDeployments(nc)

    }

    function removeDeployment(name: string) {
        const nc = { ...deployments }
        delete nc[name]
        setDeployments(nc)
    }

    return { deployments, newDeployment, removeDeployment }
}
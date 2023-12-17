import { useEffect, useState } from "react"

type deployment = {
    "txid": string,
    "env": string
}

export type deploymentType = {
    [key: string]: deployment
}

export default function useDeployments() {
    const [localDeployments, setLocalDeployments] = useState<deploymentType>(JSON.parse(sessionStorage.getItem("localDeployments")!) || {})
    const [netDeployments, setNetDeployments] = useState<deploymentType>(JSON.parse(localStorage.getItem("deployments")!) || {})


    useEffect(() => {
        if (localDeployments) sessionStorage.setItem("localDeployments", JSON.stringify(localDeployments))
        if (netDeployments) localStorage.setItem("deployments", JSON.stringify(netDeployments))
    }, [localDeployments, netDeployments])

    function newDeployment(name: string, txid: string, env: string) {
        if (env == "local") {
            const nc = {
                ...localDeployments,
                [name]: {
                    "txid": txid,
                    "env": env
                }
            }
            setLocalDeployments(nc)
        } else {
            const nc = {
                ...netDeployments,
                [name]: {
                    "txid": txid,
                    "env": env
                }
            }
            setNetDeployments(nc)
        }
    }

    function removeDeployment(name: string, env: string) {
        if (env == "local") {
            const nc = { ...localDeployments }
            delete nc[name]
            setLocalDeployments(nc)
        } else {
            const nc = { ...netDeployments }
            delete nc[name]
            setNetDeployments(nc)
        }
    }

    return { localDeployments, netDeployments, newDeployment, removeDeployment }
}
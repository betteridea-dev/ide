import { useEffect, useState } from "react"
import { contractSrc, stateSrc } from "../templates/hello"

type contract = {
    "contract.js": string,
    "state.json": string,
    "README.md": string
}

export type contractsType = {
    [key: string]: contract
}

const freshStart: contractsType = {
    "hello": {
        "contract.js": contractSrc,
        "state.json": stateSrc,
        "README.md": "# Hello"
    }

}

export default function useContracts() {
    const [contracts, setContracts] = useState<contractsType>(JSON.parse(localStorage.getItem("contracts")!) || freshStart)

    useEffect(() => {
        if (!contracts) return
        localStorage.setItem("contracts", JSON.stringify(contracts))
    }, [contracts])

    function newContract() {
        const name = prompt("Enter contract name")
        if (name in contracts) return alert("Contract with same name already exists")
        const nc = {
            ...contracts,
            [name]: {
                "contract.js": contractSrc,
                "state.json": stateSrc,
                "README.md": "# " + name
            }
        }
        setContracts(nc)
    }

    function deleteContract(name: string) {
        const nc = { ...contracts }
        delete nc[name]
        setContracts(nc)
    }

    return { contracts, setContracts, newContract, deleteContract }
}
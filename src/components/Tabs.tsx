import { useEffect, useState } from "react";
import { dropDown, dropRight } from "../assets";
import { contractSrc, stateSrc } from "../templates/hello";
import AddModal from "./Modal";
import { Link } from "react-router-dom";
import JSZip from "jszip";
import saveAs from "file-saver";
import del from "../assets/delete.svg";
import dload from "../assets/dload.svg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tabs = ({ activeContract, setActiveContract, activeFile, setActiveFile }: { activeContract: string, setActiveContract: any, activeFile: string, setActiveFile: any }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [contracts, setContracts] = useState<any>({})
    const [showDeployDropdown, setShowDeployDropdown] = useState<boolean>(false);
    const urlParams = new URLSearchParams(window.location.search)
    const conName = urlParams.get("conName")
    if (conName) {
        setActiveContract(conName)
        // setActiveFile("contract.js")
    }

    // for the create Contract modal
    const [addModal, setAddModal] = useState(false);
    const handleCreateContract = () => {
        console.log("create modal initiated", addModal);
        setAddModal(true);
    }
    useEffect(() => {
        function getLocalContracts() {
            const c = localStorage.getItem("contracts")
            if (c) {
                const parsed = JSON.parse(c)
                setContracts(parsed)
            } else {
                const c = {
                    hello: {
                        "contract.js": contractSrc,
                        "state.json": stateSrc,
                    },
                }
                localStorage.setItem("contracts", JSON.stringify(c))
                setContracts(c)
            }
        }
        getLocalContracts()
        window.addEventListener("contractsUpdated", getLocalContracts)
    }, [])

    const TabElement = ({ name }: { name: string }) => {
        const active = (activeContract === name)

        return (<div className="w-full cursor-pointer relative">
            <div className='flex w-full items-center gap-2' onClick={() => {
                setActiveContract(active ? "" : name); setActiveFile("contract.js")
                const recents = localStorage.getItem("recents")
                if (recents) {
                    const parsed = JSON.parse(recents)
                    if (parsed.includes(name)) {
                        parsed.splice(parsed.indexOf(name), 1)
                        parsed.unshift(name)
                        localStorage.setItem("recents", JSON.stringify(parsed))
                    } else {
                        parsed.unshift(name)
                        localStorage.setItem("recents", JSON.stringify(parsed))
                    }
                } else {
                    localStorage.setItem("recents", JSON.stringify([name]))
                }
            }}>
                <img src={active ? dropRight : dropDown} alt="open" />
                <span className={` pb-0.5 ${active && "text-[#B4FFA1]"}`}>{name}</span>
            </div>
            {
                active && <div className="flex flex-col gap-1 pl-3 items-start">
                    <div className="pl-4 cursor-pointer" onClick={() => setActiveFile("contract.js")}>
                        <div className="flex justify-center items-center">
                            <p className={`${activeFile == "contract.js" ? "text-white" : "text-white/60"}`}>contract.js</p>
                        </div>
                    </div>
                    <div className="pl-4 cursor-pointer" onClick={() => setActiveFile("state.json")}>
                        <div className="flex justify-center items-center ">
                            <p className={`${activeFile == "state.json" ? "text-white" : "text-white/60"}`}>state.json</p>
                        </div>
                    </div>
                </div>
            }
            <div className="absolute top-0 right-0 flex gap-1 items-center">
                <img src={del} width={16} className="" onClick={(e) => {
                    e.stopPropagation()
                    const c = { ...contracts }
                    delete c[name]
                    setContracts(c)
                    localStorage.setItem("contracts", JSON.stringify(c))
                }} />
                <img src={dload} width={22} className="pb-1" onClick={(e) => {
                    e.stopPropagation()
                    const zip = new JSZip()
                    zip.file("contract.js", contracts[name]["contract.js"])
                    zip.file("state.json", contracts[name]["state.json"])
                    zip.generateAsync({ type: "blob" }).then(async function (content) {
                        saveAs(content, `${name}.zip`)
                    })
                }} />
            </div>
            <hr className="border-t border-white/50 my-4" />
        </div>);
    }

    if (addModal) {
        return (
            <>
                <AddModal
                    setAddModal={setAddModal}
                    setActiveContract={setActiveContract}
                />
            </>
        )
    }
    return (
        <div className='min-w-[220px] bg-[#3d494780] h-[100vh] flex flex-col gap-5 items-center'>
            <div className="py-3 p-2 text-center bg-[#3D494780] w-full">Your Projects</div>
            <button onClick={handleCreateContract} className=" p-2 rounded-[5px] bg-black  hover:scale-105  transition-all duration-300 text-white">
                + New Contract
            </button>
            {/* <div className={`p-2 rounded-[5px]  ${activeContract ? "bg-black hover:scale-105  transition-all duration-300" : "opacity-60 cursor-default"} text-white`} to={activeContract ? `/deploy?contract=${activeContract}` : "#"}> */}
            <div className="relative">
                <button className={`p-2 rounded-[5px] bg-black transition-all duration-300 ${activeContract ? " hover:scale-105" : "opacity-40 cursor-default"} text-white`} onClick={() => activeContract && setShowDeployDropdown(!showDeployDropdown)}>Deploy On</button>
                {(showDeployDropdown) && <div className="absolute w-full right-0 bg-white rounded-b flex flex-col">
                    <Link to={`/deploy?conName=${activeContract}&depEnv=local`} className="p-2 text-black hover:bg-black/10">Local</Link>
                    <Link to={`/deploy?conName=${activeContract}&depEnv=mainnet`} className="p-2 text-black hover:bg-black/10">Mainnet</Link>
                </div>}
            </div>
            <div className="flex flex-col gap-1 overflow-scroll items-end w-full px-2">
                {Object.keys(contracts).map((tab: string) => <TabElement name={tab} />)}
            </div>
        </div>
    )
}

export default Tabs
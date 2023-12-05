import { useEffect, useState } from "react";
import { dropDown, dropRight } from "../assets";
import { contractSrc, stateSrc } from "../templates/hello";
import { Link } from "react-router-dom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tabs = ({ activeContract, setActiveContract, activeFile, setActiveFile }: { activeContract: string, setActiveContract: any, activeFile: string, setActiveFile: any }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [contracts, setContracts] = useState<any>({})

    useEffect(() => {
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
    }, [])

    const TabElement = ({ name }: { name: string }) => {
        const active = (activeContract === name)

        return (<div className="w-full cursor-pointer">
            <div className='flex w-full items-center gap-4 pr-5' onClick={() => { setActiveContract(active ? "" : name); setActiveFile("contract.js") }}>
                <img src={active ? dropRight : dropDown} alt="open" />
                <span className={`${active && "text-[#B4FFA1]"}`}>{name}</span>
            </div>
            {
                active && <div className="flex flex-col gap-1 py-1">
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
            <hr className="border-t border-white/50 my-4" />
        </div>);
    }



    return (
        <div className='w-40 bg-[#3d494780] h-[100vh] flex flex-col gap-5 items-center'>
            <h1 className=" p-2 text-center bg-[#3D494780] w-full">Your Projects</h1>
            <button className=" p-2 rounded-[5px] bg-black  hover:scale-105  transition-all duration-300 text-white">
                + New Project
            </button>
            <Link className={`p-2 rounded-[5px]  ${activeContract ? "bg-black hover:scale-105  transition-all duration-300" : "opacity-60 cursor-default"} text-white`} to={activeContract ? `/deploy?contract=${activeContract}` : "#"}>
                Deploy & Test 🚀
            </Link>
            <div className="flex flex-col gap-1 overflow-scroll ">
                {Object.keys(contracts).map((tab: string) => <TabElement name={tab} />)}
            </div>
        </div>
    )
}

export default Tabs
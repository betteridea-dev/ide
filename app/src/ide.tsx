import { useEffect, useState } from "react"
import JSZip from "jszip";
import saveAs from "file-saver";
import logo from "./assets/logo.svg"
import * as menuicons from "./assets/icons/menu"
import Home from "./components/home"
import AosHome from "./components/aosHome";
import Deploy from "./components/deploy"
import Test from "./components/test"
import Cloud from "./components/cloud"
import Showcase from "./components/showcase"
import Settings from "./components/settings"
import _delete from "./assets/delete.svg"
import download from "./assets/download.svg"
import deploy from "./assets/deploy.svg"
import bideLogo from "./assets/logo.svg"
import useContracts from "./hooks/useContracts";
import AONotebook from "./components/ao notebook";
import AOChat from "./components/aochat";

type MenuItemObj = {
    text: string,
    icon: string,
    onClick?: () => void
}

export default function IDE() {
    const { contracts, newContract, deleteContract } = useContracts()
    const [activeMenuItem, setActiveMenuItem] = useState("")
    const [showFileList, setShowFileList] = useState(true)
    const [activeContract, setActiveContract] = useState("")
    const [activeFile, setActiveFile] = useState("")
    const [testTarget, setTestTarget] = useState("")
    const [aosView, setAosView] = useState(true)

    const aosMenuItems: MenuItemObj[] = [
        {
            text: "Home",
            icon: menuicons.home,
            onClick: () => { setActiveMenuItem("Home") }
        },
        {
            text: "Notebook",
            icon: menuicons.files,
            onClick: () => { setActiveMenuItem("Notebook") }
        },
        {
            text: "AOChat",
            icon: menuicons.arglyph,
            onClick: () => { setActiveMenuItem("AOChat") }
        }
    ]

    const menuItems: MenuItemObj[] = [
        {
            text: "Home",
            icon: menuicons.home,
            onClick: () => { setActiveMenuItem("Home"); setActiveFile("") }
        },
        {
            text: "Contracts",
            icon: menuicons.files,
            onClick: () => {
                setShowFileList(!showFileList);
            }
        },
        {
            text: "Deploy",
            icon: menuicons.deploy,
            onClick: () => { setActiveMenuItem("Deploy"); setActiveFile("") }
        },
        {
            text: "Test",
            icon: menuicons.test,
            onClick: () => { setActiveMenuItem("Test"); setActiveFile("") }
        },
        {
            text: "Cloud",
            icon: menuicons.cloud,
            onClick: () => { setActiveMenuItem("Cloud"); setActiveFile("") }
        },
        {
            text: "Showcase",
            icon: menuicons.marketplace,
            onClick: () => { setActiveMenuItem("Showcase"); setActiveFile("") }
        },
        // {
        //     text: "AO",
        //     icon: menuicons.arglyph,
        //     onClick: () => { setActiveMenuItem("AO"); setActiveContract(""); setActiveFile(""); setShowFileList(false) }
        // }
    ]

    useEffect(() => {
        // const recents = JSON.parse
    }, [activeContract])

    useEffect(() => {
        // if (aosView) {
        //     setActiveContract("")
        //     setActiveFile("")
        //     setShowFileList(false)
        //     setActiveMenuItem("Home")
        // } else {
        //     setActiveMenuItem("Home")
        //     setActiveContract("")
        //     setActiveFile("")
        //     setShowFileList(true)
        // }
        setActiveContract("")
        setActiveFile("")
        setShowFileList(false)
        setActiveMenuItem("Home")

    }, [aosView])

    function FileTab({ filename }: { filename: string }) {
        // at the top bar
        return <div className={`h-full w-fit px-2 cursor-pointer items-center justify-center flex border-r border-white/30 ${activeFile == filename && "bg-white/10"}`}
            onClick={() => { setActiveFile(filename); setActiveMenuItem("Contracts"); }}
        >
            {filename}
        </div>
    }

    function MenuItem({ text, icon, onClick }: { text: string, icon: string, onClick?: () => void }) {
        const active = activeMenuItem == text
        // const [hover, setHover] = useState(false)
        // const [mpos, setMpos] = useState({ x: 0, y: 0 })

        // function mouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        //     setHover(true)
        //     setMpos({ x: e.pageX, y: e.pageY })
        // }

        // on the left sidebar
        return <div className={`w-full p-3 px-2 items-center justify-start flex gap-2 cursor-pointer ${active && "bg-white/10"}`} onClick={onClick}
        // onMouseEnter={() => setHover(true)}
        // onMouseLeave={() => setHover(false)}
        // onMouseMove={mouseMove}
        >
            <img src={icon} className="w-8 h-8 " />
            <div className={`${active && "text-[#81A5A0]"} break-keep`}>{text}</div>
            {/* {hover && <div className={`absolute bg-white/20 p-0.5 px-2 font-semibold ${active && "text-[#81A5A0]"}`} style={{ left: mpos.x + 10, top: mpos.y - 25 }}>{text}</div>} */}
        </div>
    }

    function FileListItem({ contractname }: { contractname: string }) {
        // right of the left sidebar
        const active = activeContract == contractname

        function Fileitm({ name }: { name: string }) {
            return <div className={`p-1 pl-5 cursor-pointer ${activeFile == name && "font-bold bg-white/10"}`} onClick={() => { setActiveFile(name); setActiveMenuItem("Contracts") }}>{name}</div>
        }

        return <div className={`w-full max-w-[150px] overflow-scroll cursor-pointer ${activeContract == contractname && "bg-white/10"}`}>
            <div className="w-full p-2 font-bold" onClick={() => { setActiveContract(active ? "" : contractname); setActiveFile("README.md"); setActiveMenuItem("Contracts") }}>{contractname}</div>
            {
                active && <div className="w-full flex flex-col">
                    <Fileitm name="README.md" />
                    <Fileitm name="contract.js" />
                    <Fileitm name="state.json" />
                    <div className="flex flex-col justify-evenly">
                        <button className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-green-300/50"
                            onClick={() => {
                                setActiveContract(contractname)
                                setActiveMenuItem("Deploy")
                            }}
                        ><img src={deploy} width={20} />deploy</button>
                        <button className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-green-300/50"
                            onClick={() => {
                                const zip = new JSZip();
                                const contract = zip.folder(contractname);
                                const files = contracts[contractname]
                                Object.keys(files).forEach((filename) => {
                                    contract.file(filename, files[filename]);
                                });
                                zip.generateAsync({ type: "blob" }).then(function (content) {
                                    saveAs(content, contractname + ".zip");
                                });
                            }}
                        ><img src={download} width={20} />download zip</button>
                        <button className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-green-300/50"
                            onClick={() => { deleteContract(contractname) }}
                        ><img src={_delete} width={17} />delete</button>
                    </div>
                </div>
            }
        </div>
    }

    function TabSwitcher() {
        if (aosView) {
            switch (activeMenuItem) {
                case "Home":
                    return <AosHome />
                case "Notebook":
                    return <AONotebook />
                case "AOChat":
                    return <AOChat />
                case "Settings":
                    return <Settings />
                default:
                    return <div className="w-full h-full bg-white/5"></div>
            }
        }
        else {
            switch (activeMenuItem) {
                case "Home":
                    return <Home />
                case "Contracts":
                    return <iframe className="w-full h-full" src={`/betterIDE?editor&language=${activeFile.endsWith(".js") ? "javascript" : activeFile.endsWith(".json") ? "json" : "text"}&file=${activeContract}/${activeFile}`} />
                case "Deploy":
                    return <Deploy contracts={contracts!} target={activeContract} test={(c: string) => { setActiveMenuItem("Test"); setTestTarget(c) }} />
                case "Test":
                    return <Test target={testTarget} />
                case "Cloud":
                    return <Cloud />
                case "Showcase":
                    return <Showcase />
                case "Settings":
                    return <Settings />
                default:
                    return <div className="w-full h-full bg-white/5"></div>
            }
        }
    }

    return <div className="flex flex-col min-h-screen h-screen max-h-screen">
        <div className="flex border-b border-white/30 h-10">
            <div className="min-w-[300px] p-2 flex justify-center items-center gap-2 border-r border-white/30">
                <img src={logo} className="h-6 w-6" />
                <div>Better IDE</div>
            </div>
            {activeContract && <div className=" flex">
                <FileTab filename="README.md" />
                <FileTab filename="contract.js" />
                <FileTab filename="state.json" />
            </div>}
            <div className="ml-auto flex justify-center items-center px-3">
                {aosView ? <button className="p-1 flex items-center gap-1" onClick={() => setAosView(false)}>
                    <img src={bideLogo} width={22} />
                    Switch to Warp
                </button> :
                    <button className="p-1 flex items-center gap-1" onClick={() => setAosView(true)}>
                        <img src={menuicons.arglyph} width={22} />
                        Switch to AOS
                    </button>
                }
            </div>
        </div>

        <div className="grow flex">
            <div className="w-[50px]"></div>
            <div className="absolute z-50 bg-[#0A1917] h-[calc(100vh-40px)] w-[50px] hover:w-[150px] transition-all duration-200 overflow-clip flex flex-col border-r border-white/30">
                {
                    (aosView ? aosMenuItems : menuItems).map((item, i) => {
                        return <MenuItem key={i} text={item.text} icon={item.icon} onClick={item.onClick} />
                    })
                }
                <div className="grow"></div>
                <MenuItem text="Settings" icon={menuicons.settings} onClick={() => setActiveMenuItem("Settings")} />
            </div>
            {!aosView && showFileList && <div className="min-w-[150px] border-r border-white/30">
                {
                    contracts && Object.keys(contracts).map((contractname, i) => {
                        if (contractname == "input") return
                        return <FileListItem key={i} contractname={contractname} />
                    })
                }
                <div className="p-2 cursor-pointer hover:bg-green-300/50" onClick={newContract}>+ new</div>
            </div>}
            <div className="grow">
                {TabSwitcher()}
            </div>
        </div>

    </div>
}

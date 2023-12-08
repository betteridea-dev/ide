import { useState } from "react"
import * as menuicons from "./assets/icons/menu"

type MenuItemObj = {
  text: string,
  icon: string,
  onClick?: () => void
}

export default function Layout() {
  const [activeMenuItem, setActiveMenuItem] = useState("")
  const [showFileList, setShowFileList] = useState(true)
  const [activeContract, setActiveContract] = useState("")
  const [activeFile, setActiveFile] = useState("")

  const menuItems: MenuItemObj[] = [
    {
      text: "Home",
      icon: menuicons.home,
      onClick: () => { setActiveMenuItem("Home"); setActiveFile("") }
    },
    {
      text: "Contracts",
      icon: menuicons.files,
      onClick: () => { setShowFileList(!showFileList); setActiveMenuItem("Contracts") }
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
      text: "My Cloud",
      icon: menuicons.cloud,
      onClick: () => { setActiveMenuItem("My Cloud"); setActiveFile("") }
    },
    {
      text: "Showcase",
      icon: menuicons.marketplace,
      onClick: () => { setActiveMenuItem("Showcase"); setActiveFile("") }
    }

  ]


  function FileTab({ filename }: { filename: string }) {
    // at the top bar
    return <div className={`h-full w-fit px-2 cursor-pointer items-center justify-center flex border-r border-white/30 ${activeFile == filename && "bg-white/10"}`}
      onClick={() => { setActiveFile(filename); setActiveMenuItem("Contracts") }}
    >
      {filename}
    </div>
  }

  function MenuItem({ text, icon, onClick }: { text: string, icon: string, onClick?: () => void }) {
    const active = activeMenuItem == text
    // on the left sidebar
    return <div className={`w-full p-3 px-2 items-center justify-start flex gap-2 cursor-pointer ${active && "bg-white/10"}`} onClick={onClick}>
      <img src={icon} className="w-8 h-8 " />
      <div className={`${active && "text-[#81A5A0]"}`}>{text}</div>
    </div>
  }

  function FileListItem({ contractname }: { contractname: string }) {
    // right of the left sidebar
    const active = activeContract == contractname

    function Fileitm({ name }: { name: string }) {
      return <div className={`p-1 pl-5 cursor-pointer ${activeFile == name && "font-bold bg-white/10"}`} onClick={() => setActiveFile(name)}>{name}</div>
    }

    return <div className={`w-full cursor-pointer ${activeContract == contractname && "bg-white/10"}`}>
      <div className="w-full p-2 font-bold" onClick={() => { setActiveContract(active ? "" : contractname); setActiveFile("README.md"); setActiveMenuItem("Contracts") }}>{contractname}</div>
      {
        active && <div className="w-full flex flex-col">
          <Fileitm name="README.md" />
          <Fileitm name="contract.js" />
          <Fileitm name="state.json" />
        </div>
      }
    </div>
  }

  return <div className="flex flex-col min-h-screen">
    <div className="h-10  grid grid-cols-10 border-b border-white/30">
      <div className="col-span-2 flex justify-center items-center gap-2 border-r border-white/30">
        <img src="/logo.svg" className="h-6 w-6" />
        <div>Better IDE</div>
      </div>
      <div className="col-span-8 flex">
        <FileTab filename="README.md" />
        <FileTab filename="contract.js" />
        <FileTab filename="state.json" />
      </div>
    </div>
    <div className="grow grid grid-cols-10">
      <div className="flex flex-col border-r border-white/30">
        {
          menuItems.map((item, i) => {
            return <MenuItem key={i} text={item.text} icon={item.icon} onClick={item.onClick} />
          })
        }
        <div className="grow"></div>
        <MenuItem text="Settings" icon={menuicons.settings} />
      </div>
      {showFileList && <div className="border-r border-white/30">
        <FileListItem contractname="hello" />
        <FileListItem contractname="world" />
      </div>}
      <div className={`${showFileList ? "col-span-8" : "col-span-9"}`}>

      </div>
    </div>
  </div>
}
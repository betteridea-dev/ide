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

  const menuItems: MenuItemObj[] = [
    {
      text: "Home",
      icon: menuicons.home,
      onClick: () => { setActiveMenuItem("Home") }
    },
    {
      text: "Contracts",
      icon: menuicons.files,
      onClick: () => { setShowFileList(!showFileList); setActiveMenuItem("Contracts") }
    },
    {
      text: "Deploy",
      icon: menuicons.deploy,
      onClick: () => { setActiveMenuItem("Deploy") }
    },
    {
      text: "Test",
      icon: menuicons.test,
      onClick: () => { setActiveMenuItem("Test") }
    },
    {
      text: "My Cloud",
      icon: menuicons.cloud,
      onClick: () => { setActiveMenuItem("My Cloud") }
    },
    {
      text: "Showcase",
      icon: menuicons.marketplace,
      onClick: () => { setActiveMenuItem("Showcase") }
    }

  ]


  function FileTab({ filename }: { filename: string }) {
    // at the top bar
    return <div className="h-full w-fit px-2 items-center justify-center flex border-r border-white/30">
      {filename}
    </div>
  }

  function MenuItem({ text, icon, onClick }: { text: string, icon: string, onClick?: () => void }) {
    // on the left sidebar
    return <div className={`w-full p-3 px-2 items-center justify-start flex cursor-pointer ${activeMenuItem == text && "bg-white/10"}`} onClick={onClick}>
      <img src={icon} className="w-8 h-8" />
      <div className="ml-2">{text}</div>
    </div>
  }

  function FileListItem({ contractname }: { contractname: string }) {
    // right of the left sidebar
    const active = activeContract == contractname

    return <div className={`w-full ${activeContract == contractname && "bg-white/10"}`}>
      <div className="w-full p-1 font-bold" onClick={() => setActiveContract(active ? "" : contractname)}>{contractname}</div>
      {
        active && <div className="w-full flex flex-col pl-4">
          <div className="p-1 ">README.md</div>
          <div className="p-1 ">contract.js</div>
          <div className="p-1 ">state.json</div>
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
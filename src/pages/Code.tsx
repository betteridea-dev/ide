import { useState } from "react";
import Tabs from "../components/Tabs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Code = ({ setShowSidebar }: { setShowSidebar: any }) => {
  const [activeContract, setActiveContract] = useState<string>("");
  const [activeFile, setActiveFile] = useState<string>("");
  setShowSidebar(true)

  return (
    <div className="flex w-full ">
      <Tabs activeContract={activeContract} setActiveContract={setActiveContract} activeFile={activeFile} setActiveFile={setActiveFile} />
      <div className="flex flex-col w-full bg-white/10">
        {activeContract ? <> <div className="flex gap-1">
          <div className="cursor-pointer" onClick={() => setActiveFile("contract.js")}>
            <div className={`flex p-2.5 justify-center items-center gap-1.5 ${activeFile == "contract.js" && " border-t-4 border-white"}`}>
              <p>contract.js</p>
            </div>
          </div>
          <div className="cursor-pointer" onClick={() => setActiveFile("state.json")}>
            <div className={`flex p-2.5 justify-center items-center gap-1.5 ${activeFile == "state.json" && "border-t-4 border-white"}`}>
              <p>state.json</p>
            </div>
          </div>
        </div>
          <div className="w-full h-full">
            <iframe src={`/editor?contract=${activeContract}&type=${activeFile == "contract.js" ? "javascript" : "json"}`} className="w-full h-full"></iframe>
          </div></> : <div className="text-center p-5">
          Select a contract from the list or create a new one
        </div>
        }
      </div>
    </div>
  )
}

export default Code;
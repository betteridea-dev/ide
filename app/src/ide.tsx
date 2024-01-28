import { useEffect, useState } from "react";
import JSZip from "jszip";
import saveAs from "file-saver";
import logo from "./assets/logo.svg";
import * as menuicons from "./assets/icons/menu";
import Home from "@/components/home";
import AosHome from "./components/aosHome";
import Deploy from "./components/deploy";
import Test from "./components/test";
import Cloud from "./components/cloud";
import Showcase from "./components/showcase";
import Settings from "./components/settings";
import _delete from "./assets/delete.svg";
import download from "./assets/download.svg";
import deploy from "./assets/deploy.svg";
import bideLogo from "./assets/logo.svg";
import useContracts from "./hooks/useContracts";
import AONotebook from "./components/ao notebook";
import AOChat from "./components/aochat";
import { ModeToggle } from "./components/mode-toggle";
import { Switch } from "./components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "./lib/utils";
import { Icons } from "./components/icons";
import { LucideIcon } from "lucide-react";

type MenuItemObj = {
  text: string;
  icon: LucideIcon;
  onClick?: () => void;
};

export default function IDE() {
  const { contracts, newContract, deleteContract } = useContracts();
  const [activeMenuItem, setActiveMenuItem] = useState("");
  const [showFileList, setShowFileList] = useState(true);
  const [activeContract, setActiveContract] = useState("");
  const [activeFile, setActiveFile] = useState("");
  const [testTarget, setTestTarget] = useState("");
  const [aosView, setAosView] = useState(true);

  const aosMenuItems: MenuItemObj[] = [
    {
      text: "Home",
      icon: Icons.home,
      onClick: () => {
        setActiveMenuItem("Home");
      },
    },
    {
      text: "Notebook",
      icon: Icons.projects,
      onClick: () => {
        setActiveMenuItem("Notebook");
      },
    },
    {
      text: "AOChat",
      icon: Icons.chat,
      onClick: () => {
        setActiveMenuItem("AOChat");
      },
    },
  ];

  const menuItems: MenuItemObj[] = [
    {
      text: "Home",
      icon: Icons.home,
      onClick: () => {
        setActiveMenuItem("Home");
        setActiveFile("");
      },
    },
    {
      text: "Contracts",
      icon: Icons.projects,
      onClick: () => {
        setShowFileList(!showFileList);
      },
    },
    {
      text: "Deploy",
      icon: Icons.deploy,
      onClick: () => {
        setActiveMenuItem("Deploy");
        setActiveFile("");
      },
    },
    {
      text: "Test",
      icon: Icons.test,
      onClick: () => {
        setActiveMenuItem("Test");
        setActiveFile("");
      },
    },
    {
      text: "Cloud",
      icon: Icons.executeCode,
      onClick: () => {
        setActiveMenuItem("Cloud");
        setActiveFile("");
      },
    },
    {
      text: "Showcase",
      icon: Icons.plugins,
      onClick: () => {
        setActiveMenuItem("Showcase");
        setActiveFile("");
      },
    },
    // {
    //     text: "AO",
    //     icon: menuicons.arglyph,
    //     onClick: () => { setActiveMenuItem("AO"); setActiveContract(""); setActiveFile(""); setShowFileList(false) }
    // }
  ];

  useEffect(() => {
    // const recents = JSON.parse
  }, [activeContract]);

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
    setActiveContract("");
    setActiveFile("");
    setShowFileList(false);
    setActiveMenuItem("Home");
  }, [aosView]);

  function SideMenuItem({
    text,
    Icon,
    onClick,
  }: {
    text: string;
    Icon: LucideIcon;
    onClick?: () => void;
  }) {
    const active = activeMenuItem == text;

    return (
      <div
        onClick={onClick}
        className={cn(
          "flex gap-1 items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer",
          active ? "bg-[#006F86]" : "transparent"
        )}
      >
        <Icon className="mr-2 h-4 w-4" />
        <span>{text}</span>
      </div>
    );
  }

  function FileTab({ filename }: { filename: string }) {
    // at the top bar
    return (
      <div
        className={`h-fit w-fit p-1 px-2 cursor-pointer items-center justify-center flex border rounded-lg border-white/10 ${activeFile == filename && "bg-white/10"
          }`}
        onClick={() => {
          setActiveFile(filename);
          setActiveMenuItem("Contracts");
        }}
      >
        {filename}
      </div>
    );
  }

  function FileListItem({ contractname }: { contractname: string }) {
    // right of the left sidebar
    const active = activeContract == contractname;

    function Fileitm({ name }: { name: string }) {
      return (
        <div
          className={`p-1 pl-5 cursor-pointer hover:bg-white/10 ${activeFile == name && "font-bold bg-white/10"
            }`}
          onClick={() => {
            setActiveFile(name);
            setActiveMenuItem("Contracts");
          }}
        >
          {name}
        </div>
      );
    }

    return (
      <div
        className={`w-full max-w-[150px] overflow-scroll cursor-pointer hover:bg-[#2f2f2f] ${activeContract == contractname && "bg-white/10"
          }`}
      >
        <div
          className="w-full p-2 font-bold"
          onClick={() => {
            setActiveContract(contractname);
            setActiveFile("README.md");
            setActiveMenuItem("Contracts");
          }}
        >
          {contractname}
        </div>
        {active && (
          <div className="w-full flex flex-col">
            <Fileitm name="README.md" />
            <Fileitm name="contract.js" />
            <Fileitm name="state.json" />
            <div className="flex flex-col justify-evenly">
              <button
                className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-zinc-300/50"
                onClick={() => {
                  setActiveContract(contractname);
                  setActiveMenuItem("Deploy");
                }}
              >
                <img src={deploy} width={20} />
                deploy
              </button>
              <button
                className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-zinc-300/50"
                onClick={() => {
                  const zip = new JSZip();
                  const contract = zip.folder(contractname);
                  const files = contracts[contractname];
                  Object.keys(files).forEach((filename) => {
                    contract.file(filename, files[filename]);
                  });
                  zip.generateAsync({ type: "blob" }).then(function (content) {
                    saveAs(content, contractname + ".zip");
                  });
                }}
              >
                <img src={download} width={20} />
                download zip
              </button>
              <button
                className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-zinc-300/50"
                onClick={() => {
                  deleteContract(contractname);
                }}
              >
                <img src={_delete} width={17} />
                delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function TabSwitcher() {
    if (aosView) {
      switch (activeMenuItem) {
        case "Notebook":
          return <AONotebook />;
        case "AOChat":
          return <AOChat />;
        case "Settings":
          return <Settings />;
        default:
          return <AosHome setActiveMenuItem={setActiveMenuItem} />;
      }
    } else {
      switch (activeMenuItem) {
        case "Contracts":
          return (
            <iframe
              className="w-full h-full"
              src={`/betterIDE?editor&language=${activeFile.endsWith(".js")
                ? "javascript"
                : activeFile.endsWith(".json")
                  ? "json"
                  : "text"
                }&file=${activeContract}/${activeFile}`}
            />
          );
        case "Deploy":
          return (
            <Deploy
              contracts={contracts!}
              target={activeContract}
              test={(c: string) => {
                setActiveMenuItem("Test");
                setTestTarget(c);
              }}
            />
          );
        case "Test":
          return <Test target={testTarget} />;
        case "Cloud":
          return <Cloud />;
        case "Showcase":
          return <Showcase />;
        case "Settings":
          return <Settings />;
        default:
          return <Home />;
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen h-screen max-h-screen">
      {/* Navbar */}
      <div className="flex h-20 min-h-[5rem] px-6 bg-[#111111]">
        <div className="flex justify-center items-center gap-2">
          <img src={logo} className="h-6 w-6" />

          <h1 className="bg-gradient-to-r from-[#006F86] to-white bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            BetterIDEa
            {/* | {aosView ? "AO Mode" : "Warp Mode"} */}
          </h1>
        </div>

        {activeContract && (
          <div className="flex items-center rounded-lg gap-2 mx-4">
            <FileTab filename="README.md" />
            <FileTab filename="contract.js" />
            <FileTab filename="state.json" />
          </div>
        )}

        <div className="ml-auto flex justify-center items-center px-3 gap-2">
          {/* {aosView ? (
            <Button onClick={() => setAosView(false)}>
              <img src={bideLogo} width={22} />
              Switch to Warp
            </Button>
          ) : (
            <Button onClick={() => setAosView(true)}>
              <img src={menuicons.arglyph} width={22} />
              Switch to AOS
            </Button>
          )} */}

          {aosView ? "AO Mode" : "Warp Mode"}
          <Switch
            checked={aosView}
            onCheckedChange={(val) => {
              setAosView(val);
            }}
          />

          {/* <ModeToggle /> */}
        </div>
      </div>

      <div className="grow flex">
        {/* Left Bar */}
        <div className="flex flex-col gap-4 px-2.5 w-48 py-4 bg-[#171717] border-r border-white/30">
          {(aosView ? aosMenuItems : menuItems).map((item, i) => {
            return (
              <SideMenuItem
                key={i}
                text={item.text}
                Icon={item.icon}
                onClick={item.onClick}
              />
            );
          })}

          <div className="flex-grow"></div>

          <SideMenuItem
            text="Settings"
            Icon={Icons.settings}
            onClick={() => setActiveMenuItem("Settings")}
          />
        </div>

        {/* File List */}
        {!aosView && showFileList && (
          <div className="min-w-[150px] border-r border-white/30 bg-[#171717]">
            {contracts &&
              Object.keys(contracts).map((contractname, i) => {
                if (contractname == "input") return;
                return <FileListItem key={i} contractname={contractname} />;
              })}
            <div
              className="p-2 cursor-pointer hover:bg-[#2f2f2f]"
              onClick={newContract}
            >
              + new
            </div>
          </div>
        )}

        {/* Main Screen */}
        <div className="grow bg-[#1d1d1d]">{TabSwitcher()}</div>
      </div>
    </div>
  );
}

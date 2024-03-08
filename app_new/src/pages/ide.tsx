import { useEffect, useState } from "react";
import JSZip from "jszip";
import saveAs from "file-saver";
import { LucideIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import Home from "@/_components/home";
import AosHome from "@/_components/aoHome";
import Deploy from "@/_components/deploy";
import Test from "@/_components/test";
import Cloud from "@/_components/cloud";
import Showcase from "@/_components/showcase";
import Settings from "@/_components/settings";
import AONotebook from "@/_components/aoNotebook";
import AOChat from "@/_components/aoChat";

import useContracts from "../../hooks/useContracts";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

import _delete from "@/_assets/delete.svg";
import download from "@/_assets/download.svg";
import deploy from "@/_assets/deploy.svg";

type MenuItemObj = {
  text: string;
  icon: LucideIcon;
  onClick?: () => void;
};

export default function IDE() {
  const contracts = useContracts();
  const [activeMenuItem, setActiveMenuItem] = useState("");
  const [showFileList, setShowFileList] = useState(true);
  const [activeContract, setActiveContract] = useState("");
  const [activeFile, setActiveFile] = useState("");
  const [testTarget, setTestTarget] = useState("");
  const [aosView, setAosView] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [importNBfrom, setImportNBfrom] = useState("");
  const [connected, setConnected] = useState(false);

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
    // {
    //   text: "AOChat",
    //   icon: Icons.chat,
    //   onClick: () => {
    //     setActiveMenuItem("AOChat");
    //   },
    // },
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
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wallet = (window as any).arweaveWallet;
      if (wallet) {
        if (await wallet.getActiveAddress()) {
          setConnected(true);
        } else {
          await wallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
          setConnected(true);
        }
      } else {
        alert("Please install the ArConnect extension");
      }
    })();
  }, []);

  useEffect(() => {
    async function connectWallet() {
      if (!(window as any).arweaveWallet)
        return alert("Please install the ArConnect extension");
      try {
        await (window as any).arweaveWallet.getActiveAddress();
        setConnected(true);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (window as any).arweaveWallet.connect([
          "ACCESS_ADDRESS",
          "SIGN_TRANSACTION",
        ]);
        setConnected(true);
      }

      const importNotebook = searchParams.has("getcode");
      if (importNotebook && aosView) {
        const importProcess = searchParams.get("getcode");
        console.log(importProcess);
        if (importProcess.length !== 43) return alert("Invalid process ID");
        setActiveMenuItem("Notebook");
      }
    }
    connectWallet();
  }, []);

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
        className={`h-fit w-fit p-1 px-2 cursor-pointer items-center justify-center flex border rounded-lg border-white/10 ${
          activeFile == filename && "bg-white/10"
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
          className={`p-1 pl-5 cursor-pointer hover:bg-white/10 ${
            activeFile == name && "font-bold bg-white/10"
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
        className={`w-full max-w-[150px] overflow-scroll cursor-pointer hover:bg-[#2f2f2f] ${
          activeContract == contractname && "bg-white/10"
        }`}
      >
        <div
          className="w-full p-2 font-bold"
          onClick={() => {
            setActiveContract(contractname);
            setActiveFile("README.md");
            setActiveMenuItem("Contracts");
            const recents = localStorage.getItem("recents");
            if (recents) {
              const recentsJson: string[] = JSON.parse(recents);
              if (recentsJson.includes(contractname)) {
                recentsJson.splice(recentsJson.indexOf(contractname), 1);
              } else if (recentsJson.length > 4) {
                recentsJson.pop();
              }
              recentsJson.unshift(contractname);
              localStorage.setItem("recents", JSON.stringify(recentsJson));
            } else {
              localStorage.setItem("recents", JSON.stringify([contractname]));
            }
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
                  contracts.deleteContract(contractname);
                  const recents =
                    JSON.parse(localStorage.getItem("recents")!) || [];
                  if (recents.includes(contractname)) {
                    recents.splice(recents.indexOf(contractname), 1);
                    localStorage.setItem("recents", JSON.stringify(recents));
                  }
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
              src={`/?editor&language=${
                activeFile.endsWith(".js")
                  ? "javascript"
                  : activeFile.endsWith(".json")
                  ? "json"
                  : activeFile.endsWith(".md")
                  ? "markdown"
                  : "text"
              }&file=${activeContract}/${activeFile}`}
            />
          );
        case "Deploy":
          return (
            <Deploy
              contracts={contracts.contracts!}
              target={activeContract}
              test={(c: string) => {
                setActiveMenuItem("Test");
                setTestTarget(c);
              }}
            />
          );
        case "Test":
          return <Test contracts={contracts} target={testTarget} />;
        case "Cloud":
          return <Cloud />;
        case "Showcase":
          return <Showcase />;
        case "Settings":
          return <Settings />;
        default:
          return (
            <Home
              contracts={contracts}
              setActiveContract={setActiveContract}
              setActiveFile={setActiveFile}
              setActiveMenuItem={setActiveMenuItem}
            />
          );
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen h-screen max-h-screen">
      {/* Navbar */}
      <div className="flex h-20 min-h-[5rem] px-6 bg-[#111111]">
        <div className="flex justify-center items-center gap-2">
          <img src="/logo-small.svg" className="h-6 w-6" />

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
            {contracts.contracts &&
              Object.keys(contracts.contracts).map((contractname, i) => {
                if (contractname == "input") return;
                return <FileListItem key={i} contractname={contractname} />;
              })}
            <div
              className="p-2 cursor-pointer hover:bg-[#2f2f2f]"
              onClick={() => contracts.newContract()}
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

import { useEffect, useState } from "react";
import JSZip from "jszip";
import saveAs from "file-saver";
import { useSearchParams } from "react-router-dom";

import MainNavBar, { MainNavFileTab } from "@/components/main-nav";
import { TSideNavItem } from "types";
import SideNav from "@/components/side-nav";

import useContracts from "../../hooks/useContracts";
import { Icons } from "@/components/icons";

import Home from "@/_components/home";
import AosHome from "@/_components/aoHome";
import Deploy from "@/_components/deploy";
import Test from "@/_components/test";
import Cloud from "@/_components/cloud";
import Showcase from "@/_components/showcase";
import Settings from "@/_components/settings";
import AONotebook from "@/_components/aoNotebook";
import AOChat from "@/_components/aoChat";

import _delete from "@/_assets/delete.svg";
import download from "@/_assets/download.svg";
import deploy from "@/_assets/deploy.svg";

export default function IDE() {
  const contracts = useContracts();
  const [searchParams, setSearchParams] = useSearchParams();

  const [aosView, setAosView] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState("");

  const [activeFile, setActiveFile] = useState("");
  const [showFileList, setShowFileList] = useState(true);
  const [activeContract, setActiveContract] = useState("");

  const [testTarget, setTestTarget] = useState("");
  const [importNBfrom, setImportNBfrom] = useState("");
  const [connected, setConnected] = useState(false);

  const aosMenuItems: TSideNavItem[] = [
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

  const menuItems: TSideNavItem[] = [
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
    setActiveMenuItem("Home");
    setActiveContract("");
    setActiveFile("");
    setShowFileList(false);

    // setShowFileList(!aosView);
  }, [aosView]);

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
      {/* Main Navbar (Top) */}
      <MainNavBar aosView={aosView} setAosView={setAosView}>
        {activeContract && (
          <div className="flex items-center rounded-lg gap-2 mx-4">
            <MainNavFileTab
              filename="README.md"
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              setActiveMenuItem={setActiveMenuItem}
            />

            <MainNavFileTab
              filename="contract.js"
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              setActiveMenuItem={setActiveMenuItem}
            />

            <MainNavFileTab
              filename="state.json"
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              setActiveMenuItem={setActiveMenuItem}
            />
          </div>
        )}
      </MainNavBar>

      <div className="grow flex">
        {/* Left Bar */}
        <SideNav
          items={aosView ? aosMenuItems : menuItems}
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
        />

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

        {/* Main Content */}
        <div className="grow bg-[#1d1d1d]">{TabSwitcher()}</div>
      </div>
    </div>
  );
}

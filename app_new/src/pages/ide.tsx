import { useEffect, useState } from "react";
import JSZip from "jszip";
import saveAs from "file-saver";
import { useSearchParams } from "react-router-dom";

import MainNavBar, { MainNavFileTab } from "@/components/main-nav";
import { TSideNavItem } from "types";
import SideNav from "@/components/side-nav";

import { cn } from "@/lib/utils";
import useContracts from "../../hooks/useContracts";
import { Icons } from "@/components/icons";
import { AOHome, AONotebook, AOChat } from "@/components/ao";
import {
  WrapCloud,
  WrapDeploy,
  WrapHome,
  WrapSettings,
  WrapShowcase,
  WrapTest,
} from "@/components/warp";
import { useAppSelector, useAppDispatch } from "../../hooks/store";
import { setActiveSideNavItem } from "@/store/app-store";

export default function IDE() {
  const contracts = useContracts();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { appMode, activeSideNavItem } = useAppSelector((state) => state.app);

  const [activeFile, setActiveFile] = useState("");
  const [showFileList, setShowFileList] = useState(true);
  const [activeContract, setActiveContract] = useState("");

  const [testTarget, setTestTarget] = useState("");
  const [importNBfrom, setImportNBfrom] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  function setActiveMenuItem(s: string) {
    dispatch(setActiveSideNavItem(s));
  }

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
          setIsWalletConnected(true);
        } else {
          await wallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
          setIsWalletConnected(true);
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
        setIsWalletConnected(true);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (window as any).arweaveWallet.connect([
          "ACCESS_ADDRESS",
          "SIGN_TRANSACTION",
        ]);
        setIsWalletConnected(true);
      }

      const importNotebook = searchParams.has("getcode");
      if (importNotebook && appMode === "aos") {
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

    // setShowFileList(appMode === "wrap");
  }, [appMode]);

  // TODO: Refactor this into a separate component
  // Need centralized state management to absteract this
  function ContractListItem({
    contractName: contractName,
  }: {
    contractName: string;
  }) {
    const active = activeContract == contractName;

    function ContractFileItem({ name }: { name: string }) {
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
        className={cn(
          "w-full max-w-[150px] overflow-scroll cursor-pointer hover:bg-[#2f2f2f]",
          activeContract == contractName && "bg-white/10"
        )}
      >
        <div
          className="w-full p-2 font-bold"
          onClick={() => {
            setActiveContract(contractName);
            setActiveFile("README.md");
            setActiveMenuItem("Contracts");

            const recents = localStorage.getItem("recents");

            if (recents) {
              const recentsJson: string[] = JSON.parse(recents);

              if (recentsJson.includes(contractName)) {
                recentsJson.splice(recentsJson.indexOf(contractName), 1);
              } else if (recentsJson.length > 4) {
                recentsJson.pop();
              }

              recentsJson.unshift(contractName);
              localStorage.setItem("recents", JSON.stringify(recentsJson));
            } else {
              localStorage.setItem("recents", JSON.stringify([contractName]));
            }
          }}
        >
          {contractName}
        </div>

        {active && (
          <div className="w-full flex flex-col">
            <ContractFileItem name="README.md" />
            <ContractFileItem name="contract.js" />
            <ContractFileItem name="state.json" />

            <div className="flex flex-col justify-evenly">
              <button
                className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-zinc-300/50"
                onClick={() => {
                  setActiveContract(contractName);
                  setActiveMenuItem("Deploy");
                }}
              >
                <Icons.deploy height={16} width={16} />
                deploy
              </button>

              <button
                className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-zinc-300/50"
                onClick={() => {
                  const zip = new JSZip();
                  const contract = zip.folder(contractName);
                  const files = contracts.contracts[contractName];

                  Object.keys(files).forEach((filename) => {
                    contract?.file(filename, files[filename]);
                  });

                  zip.generateAsync({ type: "blob" }).then(function (content) {
                    saveAs(content, contractName + ".zip");
                  });
                }}
              >
                <Icons.download height={16} width={16} />
                download zip
              </button>

              <button
                className="flex items-center justify-start gap-2 py-1 pl-2 hover:bg-zinc-300/50"
                onClick={() => {
                  contracts.deleteContract(contractName);

                  const recents =
                    JSON.parse(localStorage.getItem("recents")!) || [];

                  if (recents.includes(contractName)) {
                    recents.splice(recents.indexOf(contractName), 1);
                    localStorage.setItem("recents", JSON.stringify(recents));
                  }
                }}
              >
                <Icons.delete height={16} width={16} />
                delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function TabSwitcher() {
    if (appMode === "aos") {
      switch (activeSideNavItem) {
        case "Notebook":
          return <AONotebook />;
        case "AOChat":
          return <AOChat />;
        case "Settings":
          return <WrapSettings />;
        default:
          return <AOHome setActiveMenuItem={setActiveMenuItem} />;
      }
    } else {
      switch (activeSideNavItem) {
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
            <WrapDeploy
              contracts={contracts.contracts!}
              target={activeContract}
              test={(c: string) => {
                setActiveMenuItem("Test");
                setTestTarget(c);
              }}
            />
          );
        case "Test":
          return <WrapTest contracts={contracts} target={testTarget} />;
        case "Cloud":
          return <WrapCloud />;
        case "Showcase":
          return <WrapShowcase />;
        case "Settings":
          return <WrapSettings />;
        default:
          return (
            <WrapHome
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
      <MainNavBar>
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
          items={appMode === "aos" ? aosMenuItems : menuItems}
          activeMenuItem={activeSideNavItem}
          setActiveMenuItem={setActiveMenuItem}
        />

        {/* File List */}
        {appMode === "wrap" && showFileList && (
          <div className="min-w-[150px] border-r border-white/30 bg-[#171717]">
            {contracts.contracts &&
              Object.keys(contracts.contracts).map((contractname, i) => {
                if (contractname == "input") return;

                return <ContractListItem key={i} contractName={contractname} />;
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

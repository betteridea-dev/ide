"use client";

import { useEffect, useState } from "react";
import JSZip from "jszip";
import saveAs from "file-saver";

import MainNavBar, { MainNavFileTab } from "@/components/main-nav";
import { TSideNavItem } from "@/types";
import SideNav from "@/components/side-nav";

import { cn } from "@/lib/utils";
import useContracts from "@/hooks/useContracts";
import { Icons } from "@/components/icons";

import WarpHome from "@/components/warp";
import WarpDeploy from "@/components/warp";
import WarpTest from "@/components/warp";
import WarpSettings from "@/components/warp/warp-settings";

import { useAppSelector, useAppDispatch } from "@/hooks/store";
import { setActiveSideNavItem, setActiveFile, setActiveContract } from "@/store/app-store";

export default function IDE() {
  const contracts = useContracts();
  const dispatch = useAppDispatch();

  useEffect(() => {}, []);

  const { appMode, activeSideNavItem, activeFile, activeContract } = useAppSelector((state) => state.app);

  const [showFileList, setShowFileList] = useState(true);
  const [testTarget, setTestTarget] = useState("");

  function setActiveMenuItem(s: string) {
    dispatch(setActiveSideNavItem(s));
  }

  function _setActiveFile(s: string) {
    dispatch(setActiveFile(s));
  }

  const menuItems: TSideNavItem[] = [
    {
      text: "Home",
      icon: Icons.home,
      onClick: () => {
        setActiveMenuItem("Home");
        _setActiveFile("");
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
        _setActiveFile("");
      },
    },
    {
      text: "Test",
      icon: Icons.test,
      onClick: () => {
        setActiveMenuItem("Test");
        _setActiveFile("");
      },
    },
    {
      text: "Cloud",
      icon: Icons.executeCode,
      onClick: () => {
        setActiveMenuItem("Cloud");
        _setActiveFile("");
      },
    },
    {
      text: "Showcase",
      icon: Icons.plugins,
      onClick: () => {
        setActiveMenuItem("Showcase");
        _setActiveFile("");
      },
    },
    // {
    //     text: "AO",
    //     icon: menuicons.arglyph,
    //     onClick: () => { setActiveMenuItem("AO"); _setActiveContract(""); _setActiveFile(""); setShowFileList(false) }
    // }
  ];

  useEffect(() => {
    setShowFileList(false);
  }, [appMode]);

  function TabSwitcher() {
    switch (activeSideNavItem) {
      case "Contracts":
        return <iframe className="w-full h-full" src={`/?editor&language=${activeFile.endsWith(".js") ? "javascript" : activeFile.endsWith(".json") ? "json" : activeFile.endsWith(".md") ? "markdown" : "text"}&file=${activeContract}/${activeFile}`} />;
      case "Deploy":
        return (
          <WarpDeploy
            contracts={contracts.contracts!}
            target={activeContract}
            test={(c: string) => {
              setActiveMenuItem("Test");
              setTestTarget(c);
            }}
          />
        );
      case "Test":
        return <WarpTest contracts={contracts} target={testTarget} />;
      // case "Cloud":
      //   return <WarpCloud />;
      // case "Showcase":
      //   return <WarpShowcase />;
      case "Settings":
        return <WarpSettings />;
      default:
        return <WarpHome contracts={contracts} />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen h-screen max-h-screen">
      {/* Main Navbar (Top) */}
      <MainNavBar>
        {activeContract && (
          <div className="flex items-center rounded-lg gap-2 mx-4">
            <MainNavFileTab filename="README.md" />

            <MainNavFileTab filename="contract.js" />

            <MainNavFileTab filename="state.json" />
          </div>
        )}
      </MainNavBar>

      <div className="grow flex">
        {/* Left Bar */}
        <SideNav items={menuItems} />

        {/* File List */}
        {showFileList && (
          <div className="min-w-[220px] border-r border-white/30 bg-[#171717] pl-12">
            {contracts.contracts &&
              Object.keys(contracts.contracts).map((contractname, i) => {
                if (contractname == "input") return;

                return <ContractListItem key={i} contractName={contractname} />;
              })}

            <div className="p-2 cursor-pointer hover:bg-[#2f2f2f]" onClick={() => contracts.newContract()}>
              + new
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grow bg-[#1d1d1d] pl-12">{TabSwitcher()}</div>
      </div>
    </div>
  );
}

function ContractListItem({ contractName: contractName }: { contractName: string }) {
  const contracts = useContracts();
  const dispatch = useAppDispatch();

  const { activeFile, activeContract } = useAppSelector((state) => state.app);

  function setActiveMenuItem(s: string) {
    dispatch(setActiveSideNavItem(s));
  }

  function _setActiveFile(s: string) {
    dispatch(setActiveFile(s));
  }

  function _setActiveContract(s: string) {
    dispatch(setActiveContract(s === activeContract ? "" : s));
  }

  const active = activeContract == contractName;

  function ContractFileItem({ name }: { name: string }) {
    return (
      <div
        className={`p-1 pl-5 cursor-pointer hover:bg-white/10 ${activeFile == name && "font-bold bg-white/10"}`}
        onClick={() => {
          _setActiveFile(name);
          setActiveMenuItem("Contracts");
        }}
      >
        {name}
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-full overflow-scroll cursor-pointer hover:bg-[#2f2f2f]", activeContract == contractName && "bg-white/10")}>
      <div
        className="w-full p-2 font-bold"
        onClick={() => {
          _setActiveContract(contractName);
          _setActiveFile("README.md");
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
                _setActiveContract(contractName);
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

                const recents = JSON.parse(localStorage.getItem("recents")!) || [];

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

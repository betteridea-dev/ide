import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import MainNavBar from "@/components/main-nav";
import { TSideNavItem } from "types";
import SideNav from "@/components/side-nav";

import { Icons } from "@/components/icons";
import { AOHome, AONotebook, AOChat } from "@/components/ao";
import { WrapSettings } from "@/components/warp";
import { useAppSelector, useAppDispatch } from "../../hooks/store";
import { setActiveSideNavItem } from "@/store/app-store";

export default function AONotebookPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  const { appMode, activeSideNavItem } = useAppSelector((state) => state.app);

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

  useEffect(() => {
    async function connectWallet() {
      const importNotebook = searchParams.has("getcode");

      if (importNotebook && appMode === "aos") {
        const importProcess = searchParams.get("getcode");

        if (importProcess?.length !== 43) return alert("Invalid process ID");

        dispatch(setActiveSideNavItem("Notebook"));
      }
    }
    connectWallet();
  }, [appMode, searchParams, dispatch]);

  function TabSwitcher() {
    switch (activeSideNavItem) {
      case "Notebook":
        return <AONotebook />;
      case "AOChat":
        return <AOChat />;
      case "Settings":
        return <WrapSettings />;
      default:
        return <AOHome />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen h-screen max-h-screen">
      {/* Main Navbar (Top) */}
      <MainNavBar></MainNavBar>

      <div className="grow flex">
        {/* Left Bar */}
        <SideNav items={aosMenuItems} />

        {/* Main Content */}
        <div className="grow bg-[#1d1d1d]">{TabSwitcher()}</div>
      </div>
    </div>
  );
}

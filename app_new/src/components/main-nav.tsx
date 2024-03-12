import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "../../hooks/store";
import {
  setAppMode,
  setActiveSideNavItem,
  setActiveFile,
} from "@/store/app-store";

/* 
This is the Main Navigation Bar
This is shared between AO, Wrap and Editor mode
*/
export default function MainNavBar({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { appMode } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  return (
    <div className="flex h-20 min-h-[5rem] px-6 bg-[#111111]">
      <div className="flex justify-center items-center gap-2">
        <img src="/logo-small.svg" className="h-6 w-6" />

        <h1 className="bg-gradient-to-r from-[#006F86] to-white bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          BetterIDEa
        </h1>
      </div>

      {children}

      <div className="ml-auto flex justify-center items-center px-3 gap-2">
        {appMode === "aos" ? "AO Mode" : "Warp Mode"}

        <Switch
          checked={appMode === "aos"}
          onCheckedChange={(val) => {
            dispatch(setAppMode(val ? "aos" : "wrap"));
          }}
        />

        {/* <ModeToggle /> */}
      </div>
    </div>
  );
}

/* 
This goes on in between Main Nav Bar
In warp mode, it shows the list of files in the contract
*/
export function MainNavFileTab({ filename }: { filename: string }) {
  const dispatch = useAppDispatch();
  const { activeFile } = useAppSelector((state) => state.app);

  return (
    <div
      className={cn(
        "h-fit w-fit p-1 px-2 cursor-pointer items-center justify-center flex border rounded-lg border-white/10",
        activeFile == filename && "bg-white/10"
      )}
      onClick={() => {
        dispatch(setActiveFile(filename));
        dispatch(setActiveSideNavItem("Contracts"));
      }}
    >
      {filename}
    </div>
  );
}

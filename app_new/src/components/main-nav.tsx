import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/* 
This is the Main Navigation Bar
This is shared between AO, Wrap and Editor mode
*/
export default function MainNavBar({
  aosView,
  setAosView,
  children,
}: {
  aosView: boolean;
  setAosView: (b: boolean) => void;
  children?: React.ReactNode;
}) {
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
  );
}

/* 
This goes on in between Main Nav Bar
In warp mode, it shows the list of files in the contract
*/
export function MainNavFileTab({
  filename,
  activeFile,
  setActiveFile,
  setActiveMenuItem,
}: {
  filename: string;
  activeFile: string;
  setActiveFile: (s: string) => void;
  setActiveMenuItem: (s: string) => void;
}) {
  return (
    <div
      className={cn(
        "h-fit w-fit p-1 px-2 cursor-pointer items-center justify-center flex border rounded-lg border-white/10",
        activeFile == filename && "bg-white/10"
      )}
      onClick={() => {
        setActiveFile(filename);
        setActiveMenuItem("Contracts");
      }}
    >
      {filename}
    </div>
  );
}

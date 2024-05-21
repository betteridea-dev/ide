import { useRouter } from "next/navigation";
import { useGlobalState } from "@/states";
import { useProjectManager } from "@/hooks";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Title({ title }: { title: string }) {
  return (
    <div className="flex flex-row gap-6 items-center overflow-hidden mb-8">
      <h3 className="text-lg text-muted text-nowrap">{title}</h3>

      <Separator className="" />
    </div>
  );
}

export default function SettingsTab() {
  const manager = useProjectManager();
  const globalState = useGlobalState();
  const { theme, setTheme } = useTheme()

  const project = globalState.activeProject && manager.getProject(globalState.activeProject);

  return (
    <ScrollArea className="w-full h-full">
      <div className="h-full w-full p-8 max-w-4xl mx-auto">
        {/* <div className="my-5 mb-12 max-w-xl mx-auto">
          <Input type="text" placeholder="Search in settings"></Input>
        </div> */}

        <Title title="CURRENT PROJECT" />
        <div className="my-8 grid grid-cols-3">
          <div>Owner Wallet</div>
          <div className="col-span-2">{project.ownerWallet || "NA"}</div>
          <div>Process</div>
          <div className="col-span-2">{project.process || "NA"}</div>
          <div>Default Filetype</div>
          <div className="col-span-2">{project.defaultFiletype || "NA"}</div>
        </div>

        <Title title="GLOBAL" />
        <div className="my-8 grid grid-cols-3">
          <div>Theme</div>
          <Button variant="outline" size="icon" onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark")
          }}>
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>


        {/* <div className="mb-8">
          <Title title="NOTIFICATIONS" />

          <div className="items-top flex space-x-2.5">
            <Checkbox id="terms1" />

            <Label htmlFor="terms1" className="">
              Toast notifications
            </Label>
          </div>
        </div> */}

        {/* <div className="mb-8">
          <Title title="EDITOR STYLE" />

          <div className="flex flex-col gap-3">
            <p>Open all projects as</p>

            <div className="items-top flex space-x-2.5 ml-8">
              <Checkbox id="terms1" />

              <Label htmlFor="terms1" className="">
                Cells
              </Label>
            </div>
            <div className="items-top flex space-x-2.5 ml-8">
              <Checkbox id="terms1" />

              <Label htmlFor="terms1" className="">
                Files
              </Label>
            </div>
          </div>
        </div> */}

        {/* <div className="mb-8">
          <Title title="DISABLE" />

          <div className="items-top flex space-x-2.5">
            <Checkbox id="terms1" />

            <Label htmlFor="terms1" className="">
              Force disable popups
              <span className="text-sm ml-2 text-muted">(some features might not work correctly if you enable this)</span>
            </Label>
          </div>
        </div> */}
      </div>
    </ScrollArea>
  );
}

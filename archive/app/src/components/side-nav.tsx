import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { TSideNavItem } from "~/types";
import { Icons } from "@/components/icons";
import { useAppDispatch, useAppSelector } from "../../hooks/store";
import { setActiveSideNavItem } from "@/store/app-store";

/* 
This is the side navigation bar on the left
This is shared between AO, Wrap and Editor mode
*/
export default function SideNav({ items }: { items: TSideNavItem[] }) {
  const dispatch = useAppDispatch();

  const activeSideNavItem = useAppSelector(
    (state) => state.app.activeSideNavItem
  );

  return (
    <div className="flex flex-col gap-4 px-2 w-12 hover:w-48 transition-all duration-200 py-4 bg-[#171717] border-r border-white/30 absolute h-[calc(100vh-82px)] z-40 overflow-clip">
      {items.map((item, i) => {
        return (
          <SideNavItem
            key={i}
            text={item.text}
            Icon={item.icon}
            onClick={item.onClick}
            active={activeSideNavItem == item.text}
          />
        );
      })}

      <div className="flex-grow"></div>

      <SideNavItem
        text="Settings"
        Icon={Icons.settings}
        onClick={() => dispatch(setActiveSideNavItem("Settings"))}
        active={activeSideNavItem == "Settings"}
      />
    </div>
  );
}

/* 
This is the side navigation bar item
*/
export function SideNavItem({
  text,
  Icon,
  active,
  onClick,
}: {
  text: string;
  Icon: LucideIcon;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-1 items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer",
        active ? "bg-[#006F86]" : "transparent"
      )}
    >
      <Icon className="mr-3 h-4 w-4 whitespace-nowrap min-w-4" />
      <span>{text}</span>
    </div>
  );
}

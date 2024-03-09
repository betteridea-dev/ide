import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { TSideNavItem } from "~/types";
import { Icons } from "@/components/icons";

/* 
This is the side navigation bar on the left
This is shared between AO, Wrap and Editor mode
*/
export default function SideNav({
  items,
  activeMenuItem,
  setActiveMenuItem,
}: {
  items: TSideNavItem[];
  activeMenuItem: string;
  setActiveMenuItem: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-2.5 w-48 py-4 bg-[#171717] border-r border-white/30">
      {items.map((item, i) => {
        return (
          <SideNavItem
            key={i}
            text={item.text}
            Icon={item.icon}
            onClick={item.onClick}
            active={activeMenuItem == item.text}
          />
        );
      })}

      <div className="flex-grow"></div>

      <SideNavItem
        text="Settings"
        Icon={Icons.settings}
        onClick={() => setActiveMenuItem("Settings")}
        active={activeMenuItem == "Settings"}
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
        "flex gap-1 items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer",
        active ? "bg-[#006F86]" : "transparent"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      <span>{text}</span>
    </div>
  );
}

import { Icons } from "@/components/icons";

type TSideNavItem = {
  text: string;
  icon: keyof typeof Icons;
  onClick?: () => void;
};

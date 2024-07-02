import { LucideIcon } from 'lucide-react';

import Files from "./files";
import AllProjects from "./projects";
import Packages from "./packages";

export type TSidebarItem = {
    icon: LucideIcon;
    label: string;
    value: TSidebarOptions;
}

const sidebarItems:TSidebarItem[] = [Files, AllProjects, Packages]

export default sidebarItems;
export type TSidebarOptions = null | "SETTINGS" | "FILES" | "ALL_PROJECTS" | "PACKAGES";
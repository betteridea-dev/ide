import { LucideIcon } from 'lucide-react';

import Files from "./files";
import AllProjects from "./projects";
import Packages from "./packages";
import SQLite from "./sqlite-explorer"
import Interact from "./interact"
import Sam from "./sam"
import Templates from "./marketplace"
import AiChat from "./ai-chat"

export type TSidebarItem = {
    icon: LucideIcon;
    label: string;
    value: TSidebarOptions;
}

const sidebarItems: TSidebarItem[] = [Files, Packages, SQLite, Interact, Sam, Templates, AiChat];

export default sidebarItems;
export type TSidebarOptions = null | "SETTINGS" | "FILES" | "ALL_PROJECTS" | "PACKAGES" | "SQLITE_EXPLORER" | "INTERACT" | "SAM" | "MARKETPLACE" | "AI_CHAT";
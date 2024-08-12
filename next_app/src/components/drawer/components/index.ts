import { TSidebarOptions } from "@/components/sidebar/components";
import FileList from "./file-list";
import ProjectList from "./project-list";
import PackageList from "./package-list";
import SQLite from "./sqlite-explorer"
import Interact from "./interact"
import Sam from "./sam"
import Templates from "./marketplace"

const drawerItems: TDrawerItem[] = [FileList, ProjectList, PackageList, SQLite, Interact, Sam, Templates];

export default drawerItems;

export type TDrawerItem = {
    component: React.FC;
    label: string;
    value: TSidebarOptions;
}
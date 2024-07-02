import { TSidebarOptions } from "@/components/sidebar/components";
import FileList from "./file-list";
import ProjectList from "./project-list";
import PackageList from "./package-list";

const drawerItems:TDrawerItem[] = [FileList, ProjectList, PackageList]

export default drawerItems;

export type TDrawerItem = {
    component: React.FC;
    label: string;
    value: TSidebarOptions;
}
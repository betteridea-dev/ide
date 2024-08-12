import Home from "./home"
import Editor from "./editor"
import Settings from "./settings"
import AllProjects from "./all-projects"
import Marketplace from "./marketplace"

const viewItems: TView[] = [Home, Editor, Settings, AllProjects, Marketplace];

export default viewItems;

export type TView = {
    component: React.FC;
    label: string;
    value: TViewOptions;
}

export type TViewOptions = null | "ALL_PROJECTS" | "EDITOR" | "SETTINGS" | "MARKETPLACE";
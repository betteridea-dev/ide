import Home from "./home"
import Editor from "./editor"
import Settings from "./settings"

const viewItems: TView[] = [Home, Editor, Settings];

export default viewItems;

export type TView = {
    component: React.FC;
    label: string;
    value: TViewOptions;
}

export type TViewOptions = null | "ALL_PROJECTS" | "EDITOR" | "SETTINGS" ;
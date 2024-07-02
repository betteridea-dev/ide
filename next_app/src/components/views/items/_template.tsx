import { TView } from "."


function ViewComponent() {
    return <div className="p-5">
        Name
    </div>
}

const viewItem: TView = {
    component: ViewComponent,
    label: "ViewName",
    value: null // udpate this and add to the list in ./index.ts
}

export default viewItem;
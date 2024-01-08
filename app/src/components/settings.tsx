import areco from "../assets/arweave/ecosystem.svg"

export default function Settings() {
    return <div className="h-full flex flex-col gap-5 items-center justify-center">
        <img src={areco} className="w-[269px]" draggable={false} />
        <a href="https://github.com/ankushKun/betterIDE" target="_blank">
            <div className="flex items-center gap-3 font-semibold text-2xl tracking-widest ring-1 rounded-lg ring-white/20 p-2 hover:bg-white/5">
                <img src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" className="w-[60px] rounded-full" draggable={false} />
                <div>View source<br /> on Github</div>
            </div>
        </a>
    </div>
}
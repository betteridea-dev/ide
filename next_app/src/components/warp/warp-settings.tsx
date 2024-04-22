export default function WarpSettings() {
  return (
    <div className="h-full flex flex-col gap-12 items-center justify-center">
      <img src="/images/arweave/ecosystem.svg" className="w-[269px]" draggable={false} />

      <a href="https://github.com/betteridea-dev/ide" target="_blank">
        <div className="flex flex-row items-center justify-center gap-3 font-semibold text-2xl tracking-widest ring-1 rounded-lg ring-white/20 p-4 hover:bg-white/5">
          <img src="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" className="w-[64px] rounded-full" draggable={false} />

          <div>
            View source
            <br /> on Github
          </div>
        </div>
      </a>
    </div>
  );
}

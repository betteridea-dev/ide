import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/states";

export default function FileBar() {
  const globalState = useGlobalState();

  return (
    <div className="flex gap-0.5 items-start overflow-scroll">
      {globalState.openedFiles.map((file, _) => (
        <Button
          key={_}
          data-active={file == globalState.activeFile}
          variant="ghost"
          className="p-2 w-fit rounded-none border-b border-white data-[active=true]:text-btr-green data-[active=true]:border-btr-green"
          onClick={() => {
            globalState.setActiveFile(file);
          }}
        >
          {file}
        </Button>
      ))}
    </div>
  );
}

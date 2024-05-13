import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/states";
import { Icons } from "@/components/icons";

export default function FileBar() {
  const globalState = useGlobalState();

  return (
    <div className="flex gap-0.5 items-start overflow-scroll w-full z-0">
      {globalState.openedFiles.map((file, _) => (
        <Button
          key={_}
          data-active={file == globalState.activeFile}
          variant="ghost"
          className="p-2 w-fit rounded-none border-b mb-1 flex items-center justify-evenly gap-1  data-[active=true]:text-btr-green data-[active=true]:border-btr-green"
          onClick={() => {
            globalState.setActiveFile(file);
          }}
        >
          {file}
          <div className="text-btr-grey-1 rounded-full hover:bg-btr-grey-1 hover:text-black " onClick={
            (e) => {
              e.stopPropagation();
              globalState.closeFile(file)
            }
          }><Icons.close size={13} /></div>
        </Button>
      ))}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/states";
import { Icons } from "@/components/archive/icons";

export default function FileBar() {
  const globalState = useGlobalState();

  return (
    <div data-has-files={globalState.openedFiles.length > 0} className="flex items-start justify-start overflow-scroll data-[has-files=true]:border-b w-full z-0 m-0 p-0">
      {globalState.openedFiles.map((file, _) => (
        <Button
          key={_}
          data-active={file == globalState.activeFile}
          variant="ghost"
          className="p-2 w-fit rounded-none flex items-center justify-evenly gap-1  data-[active=true]:bg-primary data-[active=true]:text-white"
          onClick={() => {
            globalState.setActiveFile(file);
          }}
        >
          {file}
          <div className="hover:bg-white hover:text-primary rounded-sm" onClick={
            (e) => {
              e.stopPropagation();
              globalState.closeFile(file)
            }
          }><Icons.close size={13} className="" /></div>
        </Button>
      ))}
    </div>
  );
}

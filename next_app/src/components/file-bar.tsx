import { Button } from "@/components/ui/button";
import { useOpenedFiles } from "@/states";

export default function FileBar() {
  const openedFiles = useOpenedFiles();

  return (
    <div className="flex gap-0.5 items-start overflow-scroll">
      {openedFiles.openedFiles.map((file, _) => (
        <Button
          key={_}
          data-active={file == openedFiles.activeFile}
          variant="ghost"
          className="p-2 w-fit rounded-none border-b border-white data-[active=true]:text-btr-green data-[active=true]:border-btr-green"
          onClick={() => {
            openedFiles.setActiveFile(file);
          }}
        >
          {file}
        </Button>
      ))}
    </div>
  );
}

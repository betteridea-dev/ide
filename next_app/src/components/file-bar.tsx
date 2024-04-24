import { Button } from "@/components/ui/button";

export default function FileBar() {
  return (
    <div className="flex gap-0.5 items-start overflow-scroll">
      <Button variant="ghost" data-active className="p-2 w-fit rounded-none border-b border-white data-[active]:text-btr-green data-[active]:border-btr-green">
        chatroom.lua
      </Button>
      <Button variant="ghost" className="p-2 w-fit rounded-none border-b border-white">
        aaabbbcccddd.lua
      </Button>
    </div>
  );
}

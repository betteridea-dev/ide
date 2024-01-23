import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const frameworks = [
  {
    value: "xk33-05v32vpkkhiSsfKu25b3436-00xk33-05v32vpPa",
    label: "xk33-05v32vpkkhiSsfKu25b3436-00xk33-05v32vpPa",
  },
  {
    value: "xk33-05v32vpkkhiSsfKu25b3436-00xk33-05v32vpPb",
    label: "xk33-05v32vpkkhiSsfKu25b3436-00xk33-05v32vpPb",
  },
  {
    value: "xk33-05v32vpkkhiSsfKu25b3436-00xk33-05v32vpPc",
    label: "xk33-05v32vpkkhiSsfKu25b3436-00xk33-05v32vpPc",
  },
  {
    value: "xk33-05v32vpkkhiSsfKu25b3436-00xk33-05v32vpPd",
    label: "xk33-05v32vpkkhiSsfKu25b3436-00xk33-05v32vpPd",
  },
];

export function Combobox() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select process..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search process..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {frameworks.map((framework) => (
              <CommandItem
                key={framework.value}
                value={framework.value}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === framework.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {framework.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

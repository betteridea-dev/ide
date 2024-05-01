import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Combobox({ options, onChange }: { options: { label: string; value: string }[]; onChange: (val: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[460px] mx-auto overflow-clip truncate justify-between">
          {value ? value : "Select process..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full  p-0">
        <Command className="w-full">
          <CommandInput placeholder="Search process..." />
          <CommandEmpty>No process found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  setValue(option.label === value ? "" : option.label);
                  setOpen(false);
                  console.log(option.value);
                  onChange(option.label === value ? "" : option.value);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === option.label ? "opacity-100" : "opacity-0")} />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

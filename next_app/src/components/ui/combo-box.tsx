import { useState, useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTimeout } from "usehooks-ts";
import { GraphQLClient, gql } from "graphql-request";

export function Combobox({ defaultValue = "", triggerClassName = "", className = "", placeholder, options, onChange, onOpen = () => { }, disabled = false, onSearchChange = (e) => { } }: { triggerClassName?: string, className?: string; placeholder: string, options: { label: string; value: string }[]; onChange: (val: string) => void; onOpen?: () => void; disabled?: boolean; onSearchChange?: (e: string) => void; defaultValue?: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);

  return (
    <Popover
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
        onOpen();
      }}
    >
      <PopoverTrigger asChild disabled={disabled} className={triggerClassName}>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full mx-auto overflow-clip truncate justify-between border-border/60">
          {value ? value : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn(className, "w-fit p-0")} align="center" side="bottom">
        <Command className={cn(className, "w-full max-h-[50vh] !overflow-scroll p-0")}>
          <CommandInput placeholder={placeholder} onChangeCapture={(e) => onSearchChange(e.currentTarget.value)} />
          <CommandEmpty>No process found.</CommandEmpty>
          <CommandGroup className="overflow-scroll">
            {options.map((option) => (
              <CommandItem
                key={option.label}
                value={option.value}
                onSelect={() => {
                  setValue(option.label === value ? "" : option.label);
                  setOpen(false);
                  // console.log(option.value);
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

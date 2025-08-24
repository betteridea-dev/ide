import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground rounded-t placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-b border-input flex h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base transition-[color,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-b focus-visible:border-ring",
        "aria-invalid:border-b-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

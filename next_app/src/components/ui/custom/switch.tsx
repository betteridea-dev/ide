import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const SwitchCustom = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root className={cn("peer px-0.5 rounded-[8px] relative inline-flex h-8 w-32 shrink-0 cursor-pointer items-center border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-none ring-1 ring-btr-grey-1", className)} {...props} ref={ref}>
    <div data-enabled={!props.checked} className="absolute left-3.5 z-10 text-foreground data-[enabled=true]:text-background">ao</div>
    <div data-enabled={props.checked} className="absolute right-3.5 z-10 text-foreground data-[enabled=true]:text-background">Warp</div>
    <SwitchPrimitives.Thumb className={cn("pointer-events-none block h-6 data-[state=checked]:w-16 w-11 rounded-[8px] bg-primary shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-14 data-[state=unchecked]:translate-x-0")} />
  </SwitchPrimitives.Root>
));
SwitchCustom.displayName = SwitchPrimitives.Root.displayName + "Custom";

export { SwitchCustom };

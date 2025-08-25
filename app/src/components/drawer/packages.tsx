import { Package, Construction } from "lucide-react"
import { memo } from "react"

const Packages = memo(function Packages() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="relative mb-4">
                <Package className="w-12 h-12 text-muted-foreground/50" />
                <Construction className="w-6 h-6 text-orange-500 absolute -top-1 -right-1" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
                Package Manager
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Package installation and management functionality is currently under construction for mainnet mode.
            </p>
            <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs rounded-full">
                Coming Soon
            </div>
        </div>
    )
})

export default Packages
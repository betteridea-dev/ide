import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Keyboard, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getHotkeysByCategory, getHotkeyDisplay } from '@/lib/hotkeys'

interface HotkeyReferenceProps {
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export default function HotkeyReference({ trigger, open, onOpenChange }: HotkeyReferenceProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const hotkeysByCategory = getHotkeysByCategory()

    // Filter hotkeys based on search term
    const filteredCategories = Object.entries(hotkeysByCategory).reduce((acc, [category, hotkeys]) => {
        const filteredHotkeys = hotkeys.filter(hotkey =>
            hotkey.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotkey.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (filteredHotkeys.length > 0) {
            acc[category] = filteredHotkeys
        }

        return acc
    }, {} as Record<string, typeof hotkeysByCategory[string]>)

    const defaultTrigger = (
        <Button variant="ghost" size="sm" className="gap-2 invisible">
            <Keyboard className="w-4 h-4" />
            Keyboard Shortcuts
        </Button>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="w-5 h-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search shortcuts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Shortcuts List */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    {Object.entries(filteredCategories).map(([category, hotkeys]) => (
                        <div key={category} className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {hotkeys.map((hotkey) => (
                                    <div
                                        key={hotkey.action}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm text-foreground">
                                            {hotkey.description}
                                        </span>
                                        <HotkeyBadge hotkey={hotkey.key} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {Object.keys(filteredCategories).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No shortcuts found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t pt-4 text-xs text-muted-foreground text-center">
                    <p>Tip: These shortcuts work globally throughout the application</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Component to display individual hotkey badges
function HotkeyBadge({ hotkey }: { hotkey: string }) {
    const displayKey = getHotkeyDisplay(hotkey)
    const keys = displayKey.split('+').map(k => k.trim())

    return (
        <div className="flex items-center gap-1">
            {keys.map((key, index) => (
                <div key={index} className="flex items-center gap-1">
                    <Badge
                        variant="outline"
                        className="px-2 py-1 text-xs font-btr-code bg-muted/50 border-border"
                    >
                        {key}
                    </Badge>
                    {index < keys.length - 1 && (
                        <span className="text-muted-foreground text-xs">+</span>
                    )}
                </div>
            ))}
        </div>
    )
}

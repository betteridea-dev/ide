import { useGlobalState, useProjectManager } from "@/hooks"

export default function PackageView() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    
    return <>
        {globalState.activeFile}
        {globalState.openedPackages.find((pkg) => pkg.PkgID == globalState.activeFile.split(": ")[1])?.Name}
    </>
}
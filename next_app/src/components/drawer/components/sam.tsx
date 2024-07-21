import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";
import { pushToRecents } from "@/lib/utils";
import { Combobox } from "@/components/ui/combo-box";
import { useEffect, useState } from "react";
import axios from "axios"
import { AlertCircle, AlertTriangle, BadgeInfo, ChevronRight, ExternalLink, Info, Loader, OctagonAlert, OctagonX, X } from "lucide-react";
import { useSessionStorage } from "usehooks-ts";
import Link from "next/link";
import { toast } from "sonner";

type TAnalysis = {
    name: string;
    description: string;
    pattern: string;
    severity: Severity;
    line: number;
    lines: number[] | string[]; // line number | `cell-line` number
}
type TCompactAnal = {
    [filename: string]: {
        [key: string]: TAnalysis
    }
}

enum Severity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}

function AnalyticItem({ analysis, visibleSeverity }: { analysis: TAnalysis, visibleSeverity: Severity[] }) {
    const [open, setOpen] = useState(false);

    if (!visibleSeverity.includes(analysis.severity)) return null;

    return <details data-open={open} className={`p-1 my-0.5 !rounded text-sm  hover:!bg-foreground/10 data-[open=true]:bg-foreground/5`}>
        <summary className=" flex p-0.5 cursor-pointer" onClick={() => setOpen(!open)}>
            <span className="inline-flex gap-2 items-center justify-start w-full">
                <div className="flex items-center gap-1">
                    <ChevronRight className={`${open && "rotate-90"} transition-all duration-200`} size={16} />
                    {analysis.severity == Severity.LOW && <OctagonAlert className="text-accent-foreground text-yellow-500" size={17} />}
                    {analysis.severity == Severity.MEDIUM && <OctagonAlert className="text-orange-500" size={17} />}
                    {analysis.severity == Severity.HIGH && <OctagonX className="text-red-600" size={17} />}
                </div>
                <div className="flex justify-between w-full gap-10">
                    <div>{analysis.name}</div>
                    {/* <div>line    {analysis.line}</div> */}
                </div>
            </span>
        </summary>
        <div className="pl-6">
            <div className="text-muted-foreground whitespace-normal">{analysis.description}</div>
            {/* <div className="text-muted-foreground">{analysis.pattern}</div> */}
            {analysis.lines.length > 0 && <div className="text-muted-foreground">
                {analysis.lines.map((line, _) => {
                    if (typeof line == "number")
                        return <div key={_} className="text-muted-foreground">line {line}</div>
                    else if (typeof line == "string") {// format cell-line
                        const [cell, lineN] = line.split('-');
                        return <div key={_} className="text-muted-foreground">
                            cell {cell} line {lineN}
                        </div>
                    }
                })}
            </div>}
        </div>
    </details>
}

function AnalyticFileItem({ filename, analysis, visibleSeverity }: { filename: string, analysis: { [key: string]: TAnalysis }, visibleSeverity: Severity[] }) {
    const [open, setOpen] = useState(true);
    // const low = Object.keys(analysis).filter(key => analysis[key].severity == Severity.LOW).length;
    // const medium = Object.keys(analysis).filter(key => analysis[key].severity == Severity.MEDIUM).length;
    // const high = Object.keys(analysis).filter(key => analysis[key].severity == Severity.HIGH).length;

    // count of all low medium high vulnerabilities
    let low = 0;
    let medium = 0;
    let high = 0;

    Object.keys(analysis).forEach(key => {
        const severity = analysis[key].severity;
        if (severity == Severity.LOW) low += analysis[key].lines.length;
        if (severity == Severity.MEDIUM) medium += analysis[key].lines.length;
        if (severity == Severity.HIGH) high += analysis[key].lines.length;
    })

    return <details open data-open={open} className={` my-0.5 !rounded text-sm`}>
        <summary className=" flex cursor-pointer hover:!bg-foreground/10 !rounded p-1.5" onClick={() => setOpen(!open)}>
            <span className="inline-flex gap-2 items-center justify-start w-full">
                <div className="flex items-center gap-1">
                    <ChevronRight className={`${open && "rotate-90"} transition-all duration-200`} size={16} />
                </div>
                <div className="flex justify-between w-full gap-10">
                    <div>{filename}
                        {low > 0 && <span className="mx-1 rounded-full text-xs px-1.5 bg-yellow-500/40">Low: {low}</span>}
                        {medium > 0 && <span className="mx-1 rounded-full text-xs px-1.5 bg-orange-500/40">Medium: {medium}</span>}
                        {high > 0 && <span className="mx-1 rounded-full text-xs px-1.5 bg-red-500/40">High: {high}</span>}
                    </div>
                </div>
            </span>
        </summary>
        <div className="pl-5">
            {
                Object.keys(analysis).length == 0 && <div className="text-sm text-muted-foreground px-2">
                    No vulnerabilities found
                </div>
            }
            {
                Object.keys(analysis).toSorted((a, b) => {
                    if (analysis[a].severity == Severity.LOW) return -1;
                    if (analysis[a].severity == Severity.MEDIUM && analysis[b].severity == Severity.HIGH) return -1;
                    if (analysis[a].severity == Severity.HIGH) return 1;
                    return 0;
                }).map((key, index) => <AnalyticItem key={index} analysis={analysis[key]} visibleSeverity={visibleSeverity} />)
            }
        </div>
    </details>


}

function Sam() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const projects = manager.projects;
    const project = globalState.activeProject && projects[globalState.activeProject];
    const files = Object.keys(project?.files || {})
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState(false);
    const [code, setCode] = useState('');
    // const [analysis, setAnalysis] = useSessionStorage<TAnalysis[]>("analysis", [], { initializeWithValue: true });
    const [analyzed, setAnalyzed] = useState(false);
    const [visibleSeverity, setVisibleSeverity] = useState<Severity[]>([Severity.MEDIUM, Severity.HIGH]);
    const [compactAnal, setCompactAnal] = useSessionStorage<TCompactAnal>("compact-anal", {}, { initializeWithValue: true });
    const [totalLow, setTotalLow] = useState(0);
    const [totalMedium, setTotalMedium] = useState(0);
    const [totalHigh, setTotalHigh] = useState(0);

    useEffect(() => {
        if (!project) return;
        if (!globalState.activeFile) return;
        if (!selectedFile) return;

        const file = project?.files[selectedFile!];
        console.log(file);
        setAnalyzed(false);

        let code = ''
        if (file.type == "NORMAL") {
            code = file.content.cells[0].code;
        } else {
            file.content.cellOrder.forEach(cellId => {
                if (file.content.cells[cellId].type == "CODE") {
                    code += file.content.cells[cellId].code + "\n";
                }
            })
        }
        console.log(code);
        setCode(code);
    }, [globalState.activeFile, project, selectedFile])

    useEffect(() => {
        //find total low medium high counts
        let low = 0;
        let medium = 0;
        let high = 0;

        Object.keys(compactAnal).forEach(filename => {
            Object.keys(compactAnal[filename]).forEach(key => {
                const severity = compactAnal[filename][key].severity;
                if (severity == Severity.LOW) low += compactAnal[filename][key].lines.length;
                if (severity == Severity.MEDIUM) medium += compactAnal[filename][key].lines.length;
                if (severity == Severity.HIGH) high += compactAnal[filename][key].lines.length;
            })
        })
        setTotalLow(low);
        setTotalMedium(medium);
        setTotalHigh(high);
    }, [compactAnal])

    async function analyze() {
        if (!project) return;
        if (!globalState.activeFile) return;
        if (!selectedFile) return;

        let data = new FormData();
        data.append('code', code);
        setAnalyzing(true);
        try {
            const res = await axios.postForm('https://sam-api-ahqg.onrender.com/analyze', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(res);

            const myCompactAnal = {}

            const analData: TAnalysis[] = res.data;

            const file = project?.files[selectedFile!];
            const cells = file.content.cells;
            const cellOrder = file.content.cellOrder;

            analData.forEach(anal => {
                if (file.type != "NOTEBOOK") {
                    if (!myCompactAnal[anal.name]) {
                        myCompactAnal[anal.name] = anal;
                        myCompactAnal[anal.name].lines = [anal.line];
                    }
                    if (myCompactAnal[anal.name].lines.includes(anal.line)) return;
                    myCompactAnal[anal.name].lines.push(anal.line);
                } else {
                    let lineSum = 0;
                    for (let i = 0; i < cellOrder.length; i++) {
                        const cellId = cellOrder[i];
                        const cell = cells[cellId];
                        if (cell.type == "CODE") {
                            lineSum += cell.code.split('\n').length;
                            if (lineSum >= anal.line) {
                                const lineItem = `${i + 1}-${anal.line - (lineSum - cell.code.split('\n').length)}`;
                                if (!myCompactAnal[anal.name]) {
                                    myCompactAnal[anal.name] = anal;
                                    myCompactAnal[anal.name].lines = [lineItem];
                                }
                                if (myCompactAnal[anal.name].lines.includes(lineItem)) return;
                                myCompactAnal[anal.name].lines.push(lineItem);
                                break;
                            }
                        }
                    }
                }
            })
            console.log(myCompactAnal);
            // setCompactAnal(p => { return { ...p, [selectedFile]: compactAnal } });
            setCompactAnal(p => { return { ...p, [selectedFile]: myCompactAnal } });
        } catch (e) {
            console.error(e);
            setAnalyzing(false);
            setAnalyzed(false);
            toast.error(e);
            return;
        } finally {
            setAnalyzing(false);
            setAnalyzed(true);
        }

    }

    return <div className="flex flex-col h-full max-h-[calc(100vh-50px)] relative">
        <h1 className="text-left text-muted-foreground m-3">SECURITY AUDITING MONITORING</h1>
        <div className="grid grid-cols-1 overflow-scroll p-2">
            <Combobox disabled={analyzing} placeholder="Select a file" triggerClassName="bg-foreground/5 rounded" options={files.map(file => ({ label: file, value: file }))} onChange={(e) => setSelectedFile(e)} />
            <Button className="my-2 rounded" disabled={!selectedFile || analyzing} onClick={analyze}>Run Analytics</Button>
            <hr className="my-2" />
            <div className="text-muted-foreground">Analytics</div>
            <div className="flex gap-1 items-center justify-start mb-4">
                <Button data-on={visibleSeverity.includes(Severity.LOW)} className="text-xs rounded h-7 p-2 data-[on=false]:bg-muted data-[on=false]:text-muted-foreground data-[on=false]:opacity-50"
                    onClick={() => {
                        if (visibleSeverity.includes(Severity.LOW)) setVisibleSeverity(visibleSeverity.filter(severity => severity != Severity.LOW))
                        else setVisibleSeverity([...visibleSeverity, Severity.LOW])
                    }}> {visibleSeverity.includes(Severity.LOW) && <X size={18} className="mr-1.5" />} Low {totalLow}</Button>
                <Button data-on={visibleSeverity.includes(Severity.MEDIUM)} className="text-xs rounded h-7 data-[on=false]:bg-muted data-[on=false]:text-muted-foreground data-[on=false]:opacity-50"
                    onClick={() => {
                        if (visibleSeverity.includes(Severity.MEDIUM)) setVisibleSeverity(visibleSeverity.filter(severity => severity != Severity.MEDIUM))
                        else setVisibleSeverity([...visibleSeverity, Severity.MEDIUM])

                    }}> {visibleSeverity.includes(Severity.MEDIUM) && <X size={18} className="mr-1.5" />} Medium {totalMedium} </Button>
                <Button data-on={visibleSeverity.includes(Severity.HIGH)} className="text-xs rounded h-7 data-[on=false]:bg-muted data-[on=false]:text-muted-foreground data-[on=false]:opacity-50"
                    onClick={() => {
                        if (visibleSeverity.includes(Severity.HIGH)) setVisibleSeverity(visibleSeverity.filter(severity => severity != Severity.HIGH))
                        else setVisibleSeverity([...visibleSeverity, Severity.HIGH])
                    }}>{visibleSeverity.includes(Severity.HIGH) && <X size={18} className="mr-1.5" />} High {totalHigh} </Button>
            </div>
            {analyzing && <div className="flex flex-col gap-0 items-center justify-center text-sm text-muted-foreground my-2">
                <div className="flex gap-2 items-center">
                    <Loader className="animate-spin" size={17} /> Analyzing {code.split('\n').length} line(s) of code
                </div><span className="text-xs text-muted">first run may take more time</span>
            </div>}
            {
                Object.keys(compactAnal).map((filename, index) => <AnalyticFileItem key={index} filename={filename} analysis={compactAnal[filename]} visibleSeverity={visibleSeverity} />)
            }
        </div>
        <div className="absolute bottom-0 p-2 text-muted-foreground text-center text-sm w-full bg-[#f2f2f2] dark:bg-[#191919]">Powered by <Link href="https://sam-support.arweave.net/" target="_blank" className="text-primary inline-flex gap-1">SAM <ExternalLink size={14} /></Link> (beta)</div>
    </div>
}

const drawerItem: TDrawerItem = {
    component: Sam,
    label: "SAM Audit",
    value: "SAM"
}

export default drawerItem;
import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";
import { pushToRecents } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { runLua } from "@/lib/ao-vars";
import { useSessionStorage } from "usehooks-ts";

function SQLiteExplorer() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const project = globalState.activeProject && manager.projects[globalState.activeProject];
    const [dbVarName, setDbVarName] = useSessionStorage<string>("db-var-name","", {initializeWithValue:true});
    const [fetchingTables, setFetchingTables] = useState(false);
    const [tables, setTables] = useSessionStorage<string[]>('db-tables',[],{initializeWithValue:true});

    async function fetchTables() {
        if (!dbVarName) return toast.error("DB variable name is required");
        setFetchingTables(true);
        setTables([]);
        try {
            const query = `local tables = {}
    for row in ${dbVarName}:nrows("SELECT name FROM sqlite_master WHERE type='table'") do
        table.insert(tables, row.name)
    end
    return require('json').encode(tables)`
            const res = await runLua(query, project.process);
            console.log(res);
            const { Output } = res
            const output = JSON.parse(Output.data.output);
            setTables(output);
        } catch (error) {
            console.error(error);
            toast.error(error);
            setDbVarName("");
        }
        setFetchingTables(false);
    }

    return <div className="flex flex-col max-h-[calc(100vh-40px)]">
        <h1 className="text-left text-muted-foreground m-3">SQLITE DB EXPLORER</h1>
        <span className="text-xs truncate text-muted-foreground whitespace-normal px-2">will only with processes spawned with ao-sqlite module</span>
        {
            globalState.activeProject ? <div className="p-2">
                <div className="flex gap-1"><Input placeholder="DB variable name" className="rounded-sm p-1 h-7" value={dbVarName} onChange={(e) => setDbVarName(e.target.value)} />
                    <Button size="sm" className="h-7 text-sm" disabled={fetchingTables} onClick={fetchTables}>
                        Fetch Tables {fetchingTables && <Loader size={16} className="animate-spin ml-1" />}
                    </Button>
                </div>
            </div> : <p className="text-center text-muted">No Active Project</p>
        }
        {

        }
        <div className="grid grid-cols-1 overflow-scroll">
            {
                globalState.activeProject&&tables.map((tname, i) => (
                    <Button variant="ghost" key={i} data-active={false}
                        className="rounded-none w-full mx-auto justify-start truncate data-[active=true]:bg-foreground/20"
                        onClick={() => {
                            globalState.setActiveFile(`TBL: ${dbVarName}.${tname}`)
                        }}
                    >{tname}</Button>
                ))
            }
        </div>
    </div>
}

const drawerItem: TDrawerItem = {
    component: SQLiteExplorer,
    label: "SQLite Explorer",
    value: "SQLITE_EXPLORER"
}

export default drawerItem;
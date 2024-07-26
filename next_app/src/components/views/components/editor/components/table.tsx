import { Button } from "@/components/ui/button"
import { useGlobalState, useProjectManager } from "@/hooks"
import { APM_ID, Column, runLua, TPackage } from "@/lib/ao-vars"
import { connect, createDataItemSigner } from "@permaweb/aoconnect"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Columns3, Database, Loader, Plus, Rows3, Table2, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Markdown from "react-markdown"
import { toast } from "sonner"
import { dryrun } from "@permaweb/aoconnect"
import remarkGfm from "remark-gfm"
import { getRelativeTime } from "@/lib/utils"
import { useSessionStorage } from "usehooks-ts"
import { Input } from "@/components/ui/input"

export default function TableView() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const project = globalState.activeProject && manager.getProject(globalState.activeProject)
    const dbTbl = globalState.activeFile.split("TBL: ")[1]
    const [query, setQuery] = useSessionStorage(`${dbTbl}-query`, "", { initializeWithValue: true })
    const [rows, setRows] = useSessionStorage(`${dbTbl}-rows`, [], { initializeWithValue: true })
    const [loadingRows, setLoadingRows] = useState(false)
    const [addingNewRow, setAddingNewRow] = useState(false)
    const [deletingRow, setDeletingRow] = useState(false)
    const [customQueryRunning, setCustomQueryRunning] = useState(false)
    const [deletedRow, setDeletedRow] = useState<{ [foo: string]: string }>({})
    const [customQuery, setCustomQuery] = useState("")
    const [customQueryOutput, setCustomQueryOutput] = useState("")
    const [structure, setStructure] = useSessionStorage<Column[]>(`${dbTbl}-structure`, [], { initializeWithValue: true })
    const [newRowData, setNewRowData] = useState({})
    const ao = connect()

    const dbName = dbTbl.split(".")[0]
    const tableName = dbTbl.split(".")[1]

    async function getTableDetails() {
        if (!project) return
        if (!tableName) return
        if (!dbName) return

        const query = `local tables = {}
    for row in ${dbName}:nrows("select * from sqlite_schema where name = '${tableName}'") do
        table.insert(tables, row)
    end
    local cols = {}
    for row in ${dbName}:nrows("PRAGMA table_info(${tableName});") do
        table.insert(cols, row)
    end
return require"json".encode({
        cols = cols,
        sql = tables[1].sql
})`
        const res = await runLua(query, project.process)
        const { Output } = res
        const q: { cols: Column[], sql: string } = JSON.parse(Output.data.output as string)
        setQuery(q.sql)
        setStructure(q.cols)
    }

    async function getTableRows() {
        if (!project) return
        if (!tableName) return
        if (!dbName) return

        const query = `local tables = {}
    for row in ${dbName}:nrows("select * from ${tableName}") do
        table.insert(tables, row)
    end
return require"json".encode(tables)`
        setLoadingRows(true)
        const res = await runLua(query, project.process)
        setLoadingRows(false)
        const { Output } = res
        console.log(JSON.parse(Output.data.output))
        setRows(JSON.parse(Output.data.output))
    }

    useEffect(() => {
        const l = setTimeout(() => {
            getTableDetails()
            getTableRows()
        }, 100);
        return () => clearTimeout(l)
    }, [dbTbl])


    async function deleteRow(row: { [foo: string]: string }) {
        console.log('deleting', row)
        const query = `local res = ${dbName}:exec([[DELETE FROM ${tableName} WHERE ${Object.keys(row).map(k => `${k} = ${typeof row[k] == "string" ? `"${row[k]}"` : row[k]}`).join(" AND ")}]])
return res`
        console.log(query)
        setDeletingRow(true)
        setDeletedRow(row)
        const res = await runLua(query, project.process)
        const { Output: { data: output } } = res
        console.log(output)
        setDeletingRow(false)
        setDeletedRow({})
        output.output == 0 && toast.info(`Deleted row(s)`)
        console.log(res)
        getTableRows()
    }

    async function addNewRow() {
        console.log(newRowData)

        const query = `local res = db:exec([[INSERT INTO ${tableName} (
        ${Object.keys(newRowData).join(",")}
        ) VALUES (
         ${Object.values(newRowData).map(v => {
            if (typeof (v) == "string") { return `"${v}"` } else { return v }
        }).join(",")}
        )
         ]])
return res`
        console.log(query)
        setAddingNewRow(true)
        const res = await runLua(query, project.process)
        console.log(res)
        const { Output: { data: output } } = res
        await getTableRows()
        output.output == 0 && toast.info(`Added new row`)
        output.output != 0 && toast.error(`Error ${output.output}`)
        setNewRowData({})
        setAddingNewRow(false)
    }

    async function runQuery() {
        const query = customQuery
        setCustomQueryOutput("")
        if (!query) return
        const q = `local tables = {}
    for row in db:nrows([==[${query}]==]) do
        table.insert(tables, row)
    end
return require"json".encode(tables)`
        setCustomQueryRunning(true)
        const res = await runLua(q, project.process)
        setCustomQueryRunning(false)
        const { Output } = res
        console.log(Output)
        setCustomQueryOutput(JSON.stringify(JSON.parse(Output.data.output), null, 2))

    }

    return <div className="p-5 overflow-scroll w-full">
        {!project && <p className="text-center text-muted">No Active Project</p>}
        {project && <div>
            <div className="flex gap-2 items-center">
                <div className="flex flex-col gap-2">
                    <div className="flex h-fit w-full">
                        <div className="p-2 border rounded-l-lg bg-primary/50 flex gap-1 items-center"><Database size={18} />{dbName}</div>
                        <div className="p-2 border border-l-0 rounded-r-lg bg-primary/20 flex gap-1 items-center"><Table2 size={18} />{tableName}</div>
                    </div>

                    <Dialog onOpenChange={(e) => { if (!e) { getTableDetails(); getTableRows() } }}>
                        <DialogTrigger>
                            <Button className="w-full">Custom Query</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Custom Query</DialogTitle>
                                <DialogDescription>Enter a custom SQL query</DialogDescription>
                            </DialogHeader>
                            <textarea id="custom-query-input" value={customQuery} defaultValue={customQuery} onChange={e => setCustomQuery(e.target.value)}
                                className="w-full border rounded-md font-btr-code p-2 text-xs max-h-[300px] overflow-scroll" rows={10} placeholder="SELECT * FROM ..." />
                            <div className="text-sm -mb-4">Result:</div>
                            <pre className="font-btr-code text-xs border p-1.5 rounded-md max-h-[300px] overflow-scroll">{customQueryOutput}</pre>
                            <Button disabled={customQueryRunning} onClick={runQuery}>Run Query {customQueryRunning && <Loader size={18} className="animate-spin ml-2" />}</Button>
                        </DialogContent>
                    </Dialog>
                    <div className="flex gap-2 items-center">
                        <Columns3 scale={18} strokeWidth={1} className="w-7" /> {structure.length} Attributes  <Rows3 scale={18} strokeWidth={1} className="w-7" /> {rows.length} Entries
                    </div>
                </div>
                <div className="ml-auto max-w-[50%]">
                    <span className="relative z-10 top-3 text-xs bg-background px-2 left-2">sql query</span>
                    <pre className="text-xs border p-2 pt-3 px-4 rounded-md w-full relative bg-background ml-auto overflow-scroll">
                        {query}
                    </pre>
                </div>
            </div>
            <div>
                {
                    <><table className="w-full border-collapse border border-primary/20 my-4">
                        <thead>
                            <tr className="bg-primary/20">
                                <th className="!w-fit">{loadingRows && <Loader size={15} className="animate-spin mx-auto w-fit" />}</th>
                                {/* {Object.keys(rows[0]).map((key:string, i) => <th key={i} className="border border-primary/20 p-2">{key}</th>)} */}
                                {
                                    structure.map((col, i) => col && <th key={i} className="border border-primary/20 p-2">{col.name}</th>)
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length == 0 && <tr><td colSpan={structure.length + 1} className="text-center text-muted">No Rows</td></tr>}
                            {rows.map((row, i) => <tr key={i} className="bg-muted/10 even:bg-muted/20">
                                <td className="border border-primary/20 w-10">
                                    {/* options */}
                                    <Button variant="ghost" disabled={deletingRow} className="rounded-none w-10 p-0" onClick={() => deleteRow(row)}>{deletingRow && Object.values(deletedRow).toSorted().join("_") == Object.values(row).toSorted().join("_") ? <Loader className="animate-spin" size={18} /> : <Trash2 className="text-destructive-foreground" size={18} />}</Button>
                                </td>
                                {/* {Object.values(row).map((val:string, j) => <td key={j} className="border border-primary/20 p-2">{val}</td>)} */}
                                {
                                    structure.map((col, i) => <td key={i} className="border border-primary/20 px-2">{row[col.name]}</td>)
                                }
                            </tr>)}
                            {/* add row options */}
                            <tr className="bg-primary/20">
                                <td className=" w-10 ">
                                    <Button disabled={addingNewRow} variant="ghost" className="rounded-none w-10 p-0" onClick={addNewRow}>{addingNewRow ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}</Button>
                                </td>
                                {
                                    structure.map((col, i) => <td key={i} className="border border-primary/20 p-0">
                                        <Input type="text" className="bg-transparent rounded-none ring-0 border-none" value={newRowData[col.name] || ""} placeholder={col.name} onChange={(e) => {
                                            setNewRowData({ ...newRowData, [col.name]: e.target.value })
                                        }} />
                                    </td>)
                                }
                            </tr>
                        </tbody>
                    </table>
                        <details open={false}>
                            <summary className="cursor-pointer"><span className="pl-2">Raw Table JSON</span></summary>
                            <pre className="font-btr-code m-2 p-4 rounded-md border text-xs">{JSON.stringify(rows, null, 2)}</pre>
                        </details>
                    </>
                }
            </div>
        </div>}
    </div>
}
import { CodeCell, runCell } from '@betteridea/codecell';

export default function Dev() {
    return (
        <div className="flex flex-col items-center justify-center gap-5 p-5">
            <button onClick={() => {
                runCell("1", true)
            }}>run</button>
            <CodeCell
                cellId="1" // any unique cell id
                appName="BetterIDEa" // Your unique app name
                code="print('Portable code cell ftw!')" // initial code (optional)
                devMode
            />
        </div>
    )
}
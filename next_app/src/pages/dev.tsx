export default function Dev() {
    return (
        <div className="flex flex-col items-center justify-center gap-5 p-5">
            <h1>Dev Page</h1>
            <p>CodeCell</p>

            {/* <button onClick={
                () => {
                    const iframe: HTMLIFrameElement = document.querySelector("#c1");
                    iframe.contentWindow.postMessage({ action: "run" }, "http://localhost:3000");
                }
            }>run c1</button>
            <iframe id="c1" src="http://localhost:3000/codecell" width="50%" height="400px"></iframe>

            <button onClick={
                () => {
                    const iframe: HTMLIFrameElement = document.querySelector("#c2");
                    iframe.contentWindow.postMessage({ action: "run" }, "http://localhost:3000");
                }
            }>run c2</button>
            <iframe id="c2" src="http://localhost:3000/codecell?code=print(%27hello%20ao%27)" width="50%" height="400px"></iframe> */}

        </div>
    )
}
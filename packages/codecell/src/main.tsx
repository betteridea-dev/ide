import React from 'react'
import ReactDOM from 'react-dom/client'
import CodeCell from "./components/codecell"
import runCell from "./lib/runCell"
import "./styles/index.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div style={{ padding: "10px", backgroundColor: "black", height: "100vh" }}>
      <button onClick={() => {
        runCell("1", true)
      }}>run</button>
      <CodeCell appName="test-cell" cellId="1" devMode />
    </div>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import CodeCell from "./components/codecell"
import runCell from "./lib/runCell"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <button onClick={() => {
      runCell("1")
    }}>run</button>
    <CodeCell appName="test-cell" cellId="1" />
  </React.StrictMode>,
)

import {BrowserRouter as Router} from "react-router-dom";
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
<Router>
<main className="bg-[#0A1917] text-white h-[100vh] ">
  <App/>
</main>
</Router>,
)

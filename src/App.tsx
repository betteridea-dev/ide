import { Route,Routes } from 'react-router-dom';
import Home from './pages/Home';
import Deploy from './pages/Deploy';
import Code from './pages/Code';
import PersonalCloud from './pages/PersonalCloud';
import GlobalCloud from './pages/GlobalCloud';
import './App.css'
import Sidebar from './components/Sidebar';

function App() {
  
  return (
    <>
    <div className='flex'>
    <Sidebar/>
    <div>
    <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/code" element={<Code />}></Route>
        <Route path="/deploy" element={<Deploy />}></Route>
        <Route path="/personal-cloud" element={<PersonalCloud />}></Route>
        <Route path="/global-cloud" element={<GlobalCloud />}></Route>
    </Routes>
    </div>
    </div>
    </>
  )
}

export default App

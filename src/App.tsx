import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Deploy from './pages/Deploy';
import CodeEditor from './pages/CodeEditor';
import PersonalCloud from './pages/PersonalCloud';
import GlobalCloud from './pages/GlobalCloud';
import Sidebar from './components/Sidebar';
import Code from './pages/Code';
import Test from './pages/Test';

function App() {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const urlparams = new URLSearchParams(window.location.search);
  const open = urlparams.get("open");
  const contractName = urlparams.get("contract"); // contract name
  const type = urlparams.get("type"); // js or json

  if (open == "editor") {
    return <CodeEditor setShowSidebar={setShowSidebar} contractName={contractName} type={type} />
  }

  return (
    <>
      <div className='flex w-full'>
        {showSidebar && <Sidebar />}
        <div className='w-full'>
          <Routes>
            <Route path="/" element={<Home setShowSidebar={setShowSidebar} />} />
            {/* <Route path="/editor" element={<CodeEditor setShowSidebar={setShowSidebar} />}></Route> */}
            <Route path="/code" element={<Code setShowSidebar={setShowSidebar} />}></Route>
            <Route path="/deploy" element={<Deploy setShowSidebar={setShowSidebar} />}></Route>
            <Route path="/personal-cloud" element={<PersonalCloud setShowSidebar={setShowSidebar} />}></Route>
            <Route path="/global-cloud" element={<GlobalCloud setShowSidebar={setShowSidebar} />}></Route>
            <Route path="/test" element={<Test setShowSidebar={setShowSidebar} />}></Route>
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App

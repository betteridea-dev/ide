import { useEffect, useState } from 'react'
import { viewContractState, writeContract } from 'arweavekit'

type deployments = {
  [key: string]: {
    id: string,
    env: "local" | "mainnet" | "testnet",
    functions: string[]
  }
}

const Test = ({ setShowSidebar }: { setShowSidebar: any }) => {
  // to show the side bar
  setShowSidebar(true);
  // const [functionType, setFunctionType] = useState('read');
  // const [functionArgs, setFunctionArgs] = useState('');

  const [deployments, setDeployments] = useState<deployments>({})
  const [selectedContract, setSelectedContract] = useState<string>("")
  const [functionType, setFunctionType] = useState<string>("read")
  const [functionName, setFunctionName] = useState<string>("")
  const [result, setResult] = useState<string>("")
  const [state, setState] = useState<string>("")
  const [success, setSuccess] = useState(false)

  const urlParams = new URLSearchParams(window.location.search)
  const conName = urlParams.get("conName")


  useEffect(() => {
    const deployments = sessionStorage.getItem("deployments")
    if (!deployments) return
    const parsed = JSON.parse(deployments)
    setDeployments(parsed)
    if (conName) setSelectedContract(conName)
  }, [])

  useEffect(() => {
    console.log(functionType)
  }, [functionType])

  async function interact() {
    if (!selectedContract) { setResult("please select a contract"); return }
    else if (functionType == "") { setResult("please select a function type"); return }
    else if (!functionName) { setResult("please enter a function name"); return }

    const functionArgs = JSON.parse(localStorage.getItem("jsonArgs"))
    console.log(functionType, functionArgs)


    if (functionType == "read") {
      const options = {
        function: functionName,
        ...functionArgs
      }
      console.log(options)
      const res = await viewContractState({
        environment: deployments[selectedContract].env,
        contractTxId: deployments[selectedContract].id,
        options,
        strategy: "arweave"
      })
      console.log(res)
      if (res.result.status == 200) {
        setSuccess(true)
        setResult(JSON.stringify({ result: res.viewContract.result }, null, 2))
      } else {
        setSuccess(false)
        setResult(`error: ${res.result.status}
                ${res.result.statusText}
                
                ${res.viewContract.errorMessage}`)
      }
      setState(JSON.stringify(res.viewContract.state, null, 2))
    }
    else if (functionType == "write") {
      const options = {
        function: functionName,
        ...functionArgs
      }
      console.log(options)
      try {
        const res = await writeContract({
          wallet: "use_wallet",
          environment: deployments[selectedContract].env,
          contractTxId: deployments[selectedContract].id,
          options,
          strategy: "arweave",
          cacheOptions: {
            inMemory: true
          }
        })
        console.log(res)
        if (res.result.status == 200) {
          setSuccess(true)
          setResult("TXN ID: " + res.writeContract.originalTxId)
        } else {
          setSuccess(false)
          setResult(`error: ${res.result.status}
${res.result.statusText}

${res.writeContract.errorMessage}`)

        }
        setState(JSON.stringify(res.state, null, 2))
      }
      catch (e) {
        console.log(e)
        setResult(e as string)
      }
    }
  }

  return (
    <div className='flex flex-col gap-10 justify-center items-center min-h-screen'>
      <div>
        <div>Select contract to test</div>
        <select className="border border-gray-500 rounded" value={selectedContract} onChange={(e) => setSelectedContract(e.target.value)}>
          <option value="" disabled>Select Contract</option>
          {
            Object.keys(deployments).map((key) => {
              return <option value={key}>{key} ({deployments[key].id})</option>
            })
          }
        </select>
      </div>
      <div className='grid grid-cols-2 min-w-[70%] gap-10'>
        <div className='flex flex-col gap-4'>
          <div className='font-bold text-xl'>Call a function</div>
          <div className='flex gap-5 font-light'>type of action:
            <span className='flex gap-1'>
              <input type="radio" id='read' checked={functionType == "read"} onChange={(e) => e.target.checked && setFunctionType("read")} />
              <label htmlFor="read">read</label>
            </span>
            <span className='flex gap-1'>
              <input type="radio" id='write' checked={functionType == "write"} onChange={(e) => e.target.checked && setFunctionType("write")} />
              <label htmlFor="write">write</label>
            </span>
          </div>
          <div className="">
            <div className='font-light'>Function Name</div>
            <select className="border border-gray-500 rounded" value={functionName} onChange={(e) => setFunctionName(e.target.value)}>
              <option value="" disabled>Select Function</option>
              {
                deployments[selectedContract]?.functions.map((func) => {
                  return <option value={func}>{func}</option>
                })
              }
            </select>
          </div>
          <div>
            <div className='font-light'>Input JSON</div>
            <iframe src="/betterIDE/?open=jsonArgs" className="w-full h-64 ring-1 rounded ring-white/30"></iframe>
          </div>
          <button className='bg-[#093E49] w-fit rounded p-2 px-6' onClick={() => interact()}>Get Results</button>
        </div>
        <div>
          <div className='text-2xl font-bold'>Output</div>
          <div>
            <div className='my-5'>
              <div>Result</div>
              <pre className={`p-2 rounded bg-white/10 overflow-scroll ${success ? "text-green-400" : "text-red-400"}`}>{result as string || "..."}</pre>
            </div>
            <div className='my-5'>
              <div>State</div>
              <pre className="p-2 rounded bg-white/10 overflow-scroll">{state as string || "..."}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Test
import {useState} from 'react'

const Test = ({ setShowSidebar }: { setShowSidebar: any }) => {
    // to show the side bar
    setShowSidebar(true);
    const [accessLevel, setAccessLevel] = useState('read');
    const [functionName, setFunctionName] = useState('function1');
    const [inputJson, setInputJson] = useState('');
    const handleChange=(e)=>{
        const {name,value}=e.target;
        if(name=="accessLevel")
        {
            setAccessLevel(value);
        }
        else if(name=="functionName")
        {
            setFunctionName(value);
        }
        else if(name=="inputJson")
        {
            setInputJson(value);
        }
        else
        {
            console.log("wrong name in the form");  
        }
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        // You can perform actions with the form data here
      };
  return (
    <div>
        <div className='w-full flex justify-center'>
        <div className='flex flex-col w-fit pt-24 pb-10'>
            <span className=' text-sm text-[#B9B9B9]'></span>Select contracts to test
            <select id="selectOption" className='p-2 text-base border rounded outline-none cursor-pointer bg-transparent hover:border-gray-600 focus:border-green-500 focus:ring focus:ring-green-100'>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
            </select>
        </div>
        </div>
        <div className='grid grid-cols-2 '>
        <div className="flex place-content-center w-full  flex-1 justify-center items-center h-fit">
          <form className="w-1/2 p-6 bg-transparent rounded-lg" onSubmit={handleSubmit}>
            <div className="mb-4">
                <span className='font-semibold text-lg'>Call a function</span>
              <div className='flex gap-5 items-center'>
              <label className="block  mb-2 text-sm text-[#B9B9B9] mt-4">Type of action:</label>
              <input
                type="radio"
                id="read"
                name="accessLevel"
                value="read"
                className="mr-2"
                checked={accessLevel === 'read'}
                onChange={() => setAccessLevel('read')}
              />
              <label htmlFor="read" className="mr-4">
                Read
              </label>
              <input
                type="radio"
                id="write"
                name="accessLevel"
                value="write"
                className="mr-2"
                checked={accessLevel === 'write'}
                onChange={() => setAccessLevel('write')}
              />
              <label htmlFor="write">Write</label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block   text-sm text-[#B9B9B9] mb-4">Function Name</label>
              <select
                id="functionName"
                name="functionName"
                className=" bg-transparent  w-fit p-2 border rounded outline-none"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
              >
                <option className='bg-transparent bg-black' value="function1">Function 1</option>
                <option className="bg-transparent" value="function2">Function 2</option>
                <option className='bg-transparent' value="function3">Function 3</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-[#B9B9B9] mb-4">Input JSON</label>
              <textarea
                id="inputJson"
                name="inputJson"
                rows={4}
                className="w-full p-2 border rounded outline-none border-none bg-[rgba(61,73,71,0.50)]"
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
              />
            </div>

            <button type="submit" className="bg-[#093E49] text-white py-2 px-4 rounded">
              Get Result
            </button>
          </form>
        </div>
        <div className='flex-1 place-content-center ml-32 pt-3 h-fit w-full flex flex-col first-letter'>
                <h1 className=' text-lg font-semibold mb-16'>Output</h1>
                <div className='flex flex-col'>
                    <p className='text-sm text-[#B9B9B9] mb-4'>Result</p>
                    <div className=' px-2 w-60 rounded bg-[rgba(61,73,71,0.50)] mb-8'>name</div>
                </div>
                <div className='flex flex-col'>
                    <p className='text-sm text-[#B9B9B9] mb-4'>State</p>
                    <div className='px-2 rounded bg-[rgba(61,73,71,0.50)] w-60 min-h-[53px] h-fit overflow-scroll pb-8 mb-8'>
                        Json dataaslkdjasijdoaskdaskdaskdopkasopkdaskdpok
                    </div>
                </div>
        </div>
        </div>
    </div>
  )
}

export default Test
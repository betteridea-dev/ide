import { dropDown } from "../assets";

const TabElement= ({name})=>{    
    return (<div className="w-full cursor-pointer">
    <div className='flex w-full items-center gap-4 pr-5'>
        <img src={dropDown} alt="open" />
        <span>{name}</span>
    </div>
    <hr className="border-t-2 border-gray-500 my-4"/>
    </div>);
}
const Tabs = () => {
    const tabs=["Hello","Event","Voting"];
  return (
    <div className=' w-36 bg-[#3d494780] h-[100vh] flex flex-col gap-5 items-center'>
        <h1 className=" p-2 text-center bg-[#3D494780] w-full">Your Projects</h1>
        <button className=" p-2 rounded-[5px] bg-black  hover:scale-105  transition-all duration-300 text-white">
            + New Project
        </button>
        <div className=" flex flex-col gap-1 ">
        {
        tabs.map((tab)=>{
            return (<TabElement
                name={tab}
            />);
        })
        }
        </div>
    </div>
  )
}

export default Tabs
import { search, stamp } from "../assets";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GlobalCloud = ({ setShowSidebar }: { setShowSidebar: any }) => {
  setShowSidebar(true)
  const Projects=[
    {
      name:"Project 1",
      address:"0x1234567890"
    },
    {
      name:"Project 2",
      address:"0x1234567890"
    },
    {
      name:"Project 3",
      address:"0x1234567890"
    }
  ]
  return (
    <>
    <div className="flex flex-col items-center gap-5  justify-center w-full mt-3 mb-7">
      {/* search bar */}
      <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-2">
        <img src={search} alt="search" />
      </div>
      <input
        type="text"
        className="pl-10  w-[817px] bg-transparent pr-4 py-2 border border-gray-300 rounded-full outline-none"
        placeholder="Search"
      />
      </div>
      <div>
        {/* button */}
        <div className="inline-flex items-center gap-2.5 bg-cyan-950 rounded px-3 py-[6px]">
          <button className="text-white text-sm font-normal font-inter">+ new project</button>
        </div>
      </div>
      </div>
            {/* projects section */}
      <div className="grid grid-cols-4 gap-4">
      <div className="col-span-2 flex flex-col gap-8">
        <h1 className="text-[rgba(185,185,185,0.60)] text-sm">Projects</h1>
        {/* showing projects */}
        {
        Projects.map((project)=>{
          return (
            <div className="flex gap-5">
            <span>{project.name}</span>
            <button className="bg-[#46A5FD] rounded-md px-2">View</button>
            <button className="bg-[#DB8E7D] rounded-md px-2">Import</button>
          </div>
          )
        })
        }

      </div>
      {/* Projects by section */}
      <div className="col-span-1 flex flex-col gap-8">
      <h1 className="text-[rgba(185,185,185,0.60)] text-sm">Projects</h1>
        {/* showing address */}
        {
        Projects.map((project)=>{
          return (
            <div className="flex gap-5">
            <span>{project.address}</span>
          </div>
          )
        })
        }  
      </div>
      {/* stamp it section */}
      <div className="col-span-1 flex flex-col gap-8">
      <h1 className="text-[rgba(185,185,185,0.60)] text-sm">Stamps</h1>
        {/* showing stamps */}
        {
        Projects .map(()=>{
          return (
            <img className="mx-2" width={`15px`} height={`20px`} src={stamp} alt="stamp icon" />
          )
        })
        }  
      </div>
    </div>
    </>
  )
}

export default GlobalCloud;
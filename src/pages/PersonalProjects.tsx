
import { search } from "../assets"
const PeronalProjects = ({setShowSidebar }: { setShowSidebar: any }) => {
  setShowSidebar(true)
  const Projects=[
    {
      name:"Project 1",
      deployedOn:"Localhost"
    },
    {
      name:"Project 2",
      deployedOn:"Mainnet"
    },
    {
      name:"Project 3",
      deployedOn:"Mainnet"
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
        {/* <div className="inline-flex items-center gap-2.5 bg-cyan-950 rounded px-3 py-[6px]">
          <button className="text-white text-sm font-normal font-inter">+ new project</button>
        </div> */}
      </div>
      </div>
      {/* main section */}
      <div className="grid grid-cols-4 gap-4 w-[817px] mx-auto">
      <div className="col-span-2 flex flex-col gap-8">
        <h1 className="text-[rgba(185,185,185,0.60)] text-sm">Projects</h1>
        {/* showing projects */}
        {
        Projects.map((project)=>{
          return (
            <div className="flex gap-5">
            <span>{project.name}</span>
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
            <span>{project.deployedOn}</span>
          </div>
          )
        })
        }  
      </div>
      {/* stamp it section */}
      <div className="col-span-1 flex flex-col gap-8 items-end justify-center">
      <h1 className="text-[rgba(185,185,185,0.60)] text-sm">Stamps</h1>
        {/* showing stamps */}
        {
        Projects .map((project)=>{
          return (
            <>
            {
              (project.deployedOn==="Localhost")?<button className="bg-[#46A5FD] rounded-md px-2">Save to cloud</button>:
              <button className="bg-[#DB8E7D] rounded-md px-2">Save locally</button>
            }
            </>
          )
        })
        }  
      </div>
    </div>
    </>
  )
}

export default PeronalProjects
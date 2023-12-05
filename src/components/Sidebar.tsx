import {useState} from 'react'
import { deploy, globalCloud, personalCloud, code } from '../assets'
import { Link } from 'react-router-dom'

// links for sidebar naviagtion
export const navlinks=[
    {
        name:code,
        link:"/code"
    },
    {
        name:deploy,
        link:"/deploy"
    },
    {
        name:personalCloud,
        link:"/personal-cloud"
    },
    {
        name:globalCloud,
        link:"/global-cloud"
    }
]
const Sidebar = () => {
    const [active,setActive]=useState("");
    const handleSelect=(name:string)=>{
        setActive(name);
    }
  return (
    <div className='pt-10 pr-10'>
        <div className='flex px-2 flex-col gap-5 justify-center items-center'>
            {navlinks.map((link)=>{
                return (<Link to={link.link}>
                    <div onClick={()=>handleSelect(link.name)} className={`flex flex-col justify-center rounded-[5px] items-center ${active===link.name&&'bg-[#24312F]'} hover:bg-[#24312F] hover:rounded duration-300 p-1`}>
                    <img src={link.name} alt="deploy" className='w-12 h-12'/>
                    </div>          
                </Link>);
            })}

            {/* <Link to="/deploy">
                <div className='flex flex-col justify-center items-center hover:bg-[#24312F] hover:rounded duration-300 p-1'>
                <img src={deploy} alt="test" className='w-12 h-12'/>
                </div>
            </Link>
            <Link to="/personal-cloud">
            <div className='flex flex-col justify-center items-center hover:bg-[#24312F] hover:rounded duration-300 p-1'>
            <img src={personalCloud} alt="personal cloud" className='w-12 h-12'/>
            </div>
            </Link>
            <Link to="/global-cloud">
            <div className='flex flex-col justify-center items-center hover:bg-[#24312F] hover:rounded duration-300 p-1'>
            <img src={globalCloud} alt="global cloud" className='w-12 h-12'/>
            </div>
            </Link> */}
        </div>
    </div>
  )
}

export default Sidebar
import { useState } from 'react'
import { test, deploy, code, home, browse, personalProjects } from '../assets'
import { Link } from 'react-router-dom'
import cloud from '../assets/cloud.svg'

// links for sidebar naviagtion
export const navlinks = [
    {
        iconName: "Home",
        name: home,
        link: "/"
    },
    {
        iconName: "Contracts",
        name: code,
        link: "/code"
    },
    {
        iconName: "Deploy",
        name: deploy,
        link: "/deploy"
    },
    {
        iconName: "Test",
        name: test,
        link: "/test"
    },
    ,
    {
        iconName: "My Cloud",
        name: cloud,
        link: "/my-projects"
    },
    {
        iconName: "Browse",
        name: browse,
        link: "/browse"
    }
]
const Sidebar = () => {
    const [active, setActive] = useState("");
    const handleSelect = (name: string) => {
        setActive(name);
    }
    return (
        <div className='pt-2'>
            <div className='flex px-2 flex-col items-start w-full gap-5 min-w-[200px]'>
                {navlinks.map((link) => {
                    return (<Link to={link.link} className='w-full'>
                        <div onClick={() => handleSelect(link.name)} className={`flex flex-col justify-start rounded-[5px] items-start w-full ${active === link.name && 'bg-[#24312F]'} hover:bg-[#24312F] hover:rounded duration-300 p-1`}>
                            <div className='flex items-center justify-start'>
                                <img src={link.name} alt="deploy" className='w-12 max-w-xs h-12' />
                                <p className=' text-sm '>{link.iconName}</p>
                            </div>
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
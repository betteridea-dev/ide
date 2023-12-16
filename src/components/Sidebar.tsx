import { useState } from 'react'
import { test, deploy, code, home, browse, personalProjects, activehome, activeCode, activeDeploy, activeTest, activeBrowse } from '../assets'
import { Link } from 'react-router-dom'
import cloud from '../assets/cloud.svg'
import cloudActive from "../assets/activeFolders/cloud.svg"

const Sidebar = () => {
    const [hoveredLink, setHoveredLink] = useState("");
    const [active, setActive] = useState("");
    const handleSelect = (name: string) => {
        setActive(name);
    }
    const navlinks = [
        {
            iconName: "Home",
            name: home,
            activeName: activehome,
            link: "/"
        },
        {
            iconName: "Contracts",
            name: code,
            activeName: activeCode,
            link: "/code"
        },
        {
            iconName: "Deploy",
            name: deploy,
            activeName: activeDeploy,
            link: "/deploy"
        },
        {
            iconName: "Test",
            name: test,
            activeName: activeTest,
            link: "/test"
        },
        ,
        {
            iconName: "My Cloud",
            name: cloud,
            activeName: cloudActive,
            link: "/my-projects"
        },
        {
            iconName: "Browse",
            name: browse,
            activeName: activeBrowse,
            link: "/browse"
        }
    ]
    return (
        <div className='pt-10'>
            <div className='flex px-2 flex-col items-start w-full gap-5 min-w-[200px]'>
                {navlinks.map((link) => {
                    return (<Link to={link.link} className='w-full'>
                        <div onMouseEnter={() => setHoveredLink(link.iconName)} onClick={() => handleSelect(link.iconName)} className={`flex group flex-col justify-start rounded-[5px] items-start w-full text-[] ${active === link.iconName && 'bg-[#093E494D]'} hover:bg-[#093E494D] hover:rounded duration-300 p-1 transition-all `}>
                            <div className='flex items-center justify-start'>
                                <img src={(active === link.iconName || hoveredLink === link.iconName) ? link.activeName : link.name} alt="deploy" className='w-12 max-w-xs h-12 hover:opacity-80' />
                                <p className={` text-sm group-hover:text-[#81A5A0] ${active === link.name && 'text-[#81A5A0]'}`}>{link.iconName}</p>
                            </div>
                        </div>
                    </Link>);
                })}
            </div>
        </div>
    )
}

export default Sidebar
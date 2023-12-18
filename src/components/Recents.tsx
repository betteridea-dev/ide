import { nextArrow, horizontal, activeHorizontal } from "../assets"
import { contractSrc as src1, stateSrc as sta1 } from "../templates/hello"
import { contractSrc as src2, stateSrc as sta2 } from "../templates/db"
import { contractSrc as src3, stateSrc as sta3 } from "../templates/vote"
import { contractSrc as src4, stateSrc as sta4 } from "../templates/event"
import { contractSrc as src5, stateSrc as sta5 } from "../templates/utoken"
import { Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"

const TemplateTab = ({ name }: { name: string }) => {
    // for testing purpose
    const today = new Date();
    const today_date = today.toLocaleDateString('en-GB');
    return (
        <div className="bg-white p-4 hover:scale-105 w-[18%] transition-all duration-300 rounded-[5px] group background--recent" style={{ backgroundImage: 'url(https://s3-alpha-sig.figma.com/img/accc/8cf3/e471ab771c8b887927a198b8f9bc4c03?Expires=1703462400&Signature=VtW0ffPic95HbgfpJxGpmTBymri8ohgEPaDVULD8nDQgkR3u8f5BWrafzO4Mqeiec5GMDtHma0U6POP1BvPcifj56uYGQl3j676oWnO0GiOW6L6n5eqmLgv0TCt9ZTW~Jl0LHdNM6kRaq2T3BGC21Wb2XdKBB28VbwiPOv83l~l7QlgfdLOwp5Oy1hCUTDF5a33m6BCtGM5vZ6PeZ13hzsAxjStTrT6UGVPN33FFRVzUrSYmcs~ozLUVLdaDSnRe3eE1aTo5O0T1D1NF6-X3CAp7LzaZFpqcmzyNdWdDBCRB-95UEkuEF8QnjfMRH3co6ya4QHSisxlr4AEGd6LrOQ__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4)' }}>
            <p className=" text-sm text-[#A4A4A4] pb-2">Last opened: {today_date}</p>
            <h1 className=" text-[#616161] pb-4 font-bold ">{name}</h1>
            <div className="">
                <Link to={`/code?conName=${name}`} className="bg-[#093E49] custom-width--recent  flex rounded-[3px] px-2 py-1  hover:w-40 transition-all duration-100 justify-between"
                    onClick={() => {
                        let contracts = localStorage.getItem("contracts");
                        if (!contracts) contracts = "{}";
                        const parsed = JSON.parse(contracts);
                        switch (name) {
                            case "HelloWorld":
                                parsed[name] = {
                                    "contract.js": src1,
                                    "state.json": sta1,
                                };
                                break;
                            case "CRUD Database":
                                parsed[name] = {
                                    "contract.js": src2,
                                    "state.json": sta2,
                                };
                                break;
                            case "Voting":
                                parsed[name] = {
                                    "contract.js": src3,
                                    "state.json": sta3,
                                };
                                break;
                            case "Event creation":
                                parsed[name] = {
                                    "contract.js": src4,
                                    "state.json": sta4,
                                };
                                break;
                            case "U-Token":
                                parsed[name] = {
                                    "contract.js": src5,
                                    "state.json": sta5,
                                };
                                break;
                            default:
                                break;
                        }
                        localStorage.setItem("contracts", JSON.stringify(parsed));
                    }}
                >
                    <div className="min-w-fit">Open in editor</div>
                    <img src={nextArrow} alt="next arrow" />
                </Link>
            </div>
        </div>
    )
}

const Recents = () => {
    const [active,setActive]=useState(false);
    const [recents, setRecents] = useState([])

    // to handle the scroll click
    const scrollContainerRef = useRef(null);
    const handleScrollClick=()=>{
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += 150;
        }
    }
    useEffect(() => {
        const recents = localStorage.getItem("recents")
        if (recents) {
            const parsed = JSON.parse(recents);
            setRecents(parsed)
        }
    }, [])
    return (
        <div className="overflow-x-auto pb-10 p-2 flex gap-8 max-w-[81%] ">
            {
                (recents.filter((e) => e != "").length > 0) ? recents.map((template) => {
                    if (template) return <TemplateTab key={template} name={template} />
                }) : <div>No recently opened contracts... Maybe start working on one from templates? ^_^</div>
            }
            <img 
                className="absolute mt-6 mr-5 bg-invert right-0 bg-black/30 rounded-full"   
                src={active?activeHorizontal:horizontal} 
                alt="Scroll" 
                onClick={handleScrollClick}
                onMouseEnter={()=>setActive(true)}
                onMouseLeave={()=>setActive(false)}/>
        </div>
    )
}

export default Recents;
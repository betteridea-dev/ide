import { nextArrow, horizontal } from "../assets"
import { contractSrc as src1, stateSrc as sta1 } from "../templates/hello"
import { contractSrc as src2, stateSrc as sta2 } from "../templates/db"
import { contractSrc as src3, stateSrc as sta3 } from "../templates/vote"
import { contractSrc as src4, stateSrc as sta4 } from "../templates/event"
import { contractSrc as src5, stateSrc as sta5 } from "../templates/utoken"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

const TemplateTab = ({ name }: { name: string }) => {
    return (
        <div className="bg-white p-4 hover:scale-105 transition-all duration-300 rounded-[5px] group">
            <h1 className=" text-[#616161] pb-2 font-bold ">{name}</h1>
            <div className="">
                <Link to={`/code?conName=${name}`} className="bg-[#093E49] custom-width  flex rounded-[3px] px-2 py-1  hover:w-36 transition-all duration-100 justify-between"
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
                    <div className="min-w-fit">Open</div>
                    <img src={nextArrow} alt="next arrow" />
                </Link>
            </div>
        </div>
    )
}

const Recents = () => {
    const [recents, setRecents] = useState([])

    useEffect(() => {
        const recents = localStorage.getItem("recents")
        if (recents) {
            const parsed = JSON.parse(recents)
            setRecents(parsed)
        }
    }, [])

    return (
        <div className="overflow-x-auto  pb-10 p-2 flex gap-8 max-w-[81%] ">
            {
                (recents.filter((e) => e != "").length > 0) ? recents.map((template) => {
                    if (template) return <TemplateTab
                        key={template}
                        name={template} />
                }) : <div>No recently opened contracts... Maybe start working on one from templates? ^_^</div>
            }
            <img className="absolute mt-16 mr-5 bg-invert right-0 bg-black/30 rounded-full" src={horizontal} alt="Scroll" />
        </div>
    )
}

export default Recents;
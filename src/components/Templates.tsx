import { nextArrow, horizontal } from "../assets"
import { contractSrc as src1, stateSrc as sta1 } from "../templates/hello"
import { contractSrc as src2, stateSrc as sta2 } from "../templates/db"
import { contractSrc as src3, stateSrc as sta3 } from "../templates/vote"
import { contractSrc as src4, stateSrc as sta4 } from "../templates/event"
import { contractSrc as src5, stateSrc as sta5 } from "../templates/utoken"

const TemplateTab = ({ name, description }: { name: string, description: string }) => {
    return (
        <div className="bg-white pt-4 pl-6 pb-6 pr-6  h-48 hover:scale-105 transition-all duration-300 rounded-[5px] group">
            <h1 className=" pl-3 text-[#616161] pb-2 font-bold ">{name}</h1>
            <p className=" pl-3 text-black pb-4 w-72 text-lg" dangerouslySetInnerHTML={{ __html: description }}></p>
            <div className="pl-3">
                <button className="bg-[#093E49] custom-width  flex rounded-[3px] px-2 py-1 hover:w-60 transition-all duration-300 hover:justify-between"
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
                            case "uToken":
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
                    <p>Get Started</p>
                    <img src={nextArrow} alt="next arrow" />
                </button>
            </div>
        </div>
    )
}

const Templates = () => {
    const templates = [
        {
            name: "HelloWorld",
            description: "Essential introduction <br/> to decentralised <br/> programming"
        },
        {
            name: "CRUD Database",
            description: "Streamline <br/> decentralised data <br/> operation"
        },
        {
            name: "Voting",
            description: "Enable democratic <br/> decision-making with <br/> voting functionality"
        },
        {
            name: "Event creation",
            description: "Efficiently manage <br/> events on the <br/> blockchain"
        },
        {
            name: "Event creation",
            description: "Efficiently manage <br/> events on the <br/> blockchain"
        },
        {
            name: "Event creation",
            description: "Efficiently manage <br/> events on the <br/> blockchain"
        },

        {
            name: "Event creation",
            description: "Efficiently manage <br/> events on the <br/> blockchain"
        }
    ]
    return (
        <div className="overflow-x-auto  pb-10 p-2 flex gap-8 max-w-[90%]">
            {
                templates.map((template) => {
                    return <TemplateTab
                        key={template.name}
                        name={template.name}
                        description={template.description} />
                })
            }
            <img className="absolute mt-16 mr-5 bg-invert w-10 right-0 " src={horizontal} alt="Scroll" />
        </div>
    )
}

export default Templates;
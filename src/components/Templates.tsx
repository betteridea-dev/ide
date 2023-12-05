import { nextArrow } from "../assets"

const TemplateTab=({name,description}:{name:string,description:string})=>{
    return (
        <div className="bg-white pt-4 pl-6 pb-6 pr-6  h-48 hover:scale-105 transition-all duration-300 rounded-[5px] group">
            <h1 className="text-[#616161] pb-2 font-bold ">{name}</h1>
            <p className="text-black pb-4 text-lg" dangerouslySetInnerHTML={{ __html: description }}></p>
            <Button/>
        </div>
    )    
}


function Button(){
    return (<button className="bg-[#093E49] w-72 flex rounded-[3px] px-2 py-1">
        <p>Get Started</p>
        <img src={nextArrow} alt="next arrow"/>
    </button>);
}

const Templates = () => {
    const templates=[
        {
            name:"HelloWorld",
            description:"Essential introduction <br/> to decentralised <br/> programming"
        },
        {
            name:"CRUD Database",
            description:"Streamline <br/> decentralised data <br/> operation"
        },
        {
            name:"Voting",
            description:"Enable democratic <br/> decision-making with <br/> voting functionality"
        },
        {
            name:"Event creation",
            description:"Efficiently manage <br/> events on the <br/> blockchain"
        },
        {
            name:"Event creation",
            description:"Efficiently manage <br/> events on the <br/> blockchain"
        },
        {
            name:"Event creation",
            description:"Efficiently manage <br/> events on the <br/> blockchain"
        },
        
        {
            name:"Event creation",
            description:"Efficiently manage <br/> events on the <br/> blockchain"
        }
    ]
  return (
    <div className="overflow-x-auto flex gap-8 ma w-full">
        {
            templates.map((template)=>{
                return <TemplateTab
                    key={template.name}
                    name={template.name}
                    description={template.description}/>
            })
        }
    </div>
  )
}

export default Templates;
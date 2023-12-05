import { nextArrow } from "../assets"
import Templates from "../components/Templates"

const Home = () => {
  return (
    <div className="pl-4 pt-9 cursor-pointer">
      <div className="">
      <div className="flex  p-2.5 w-fit text-left justify-center items-center gap-1.5 border-t border-white">
      <div className="flex items-center"><p className=" pb-4">Start with a project template</p>
      </div>
      <img src={nextArrow} alt="more templates" />
      </div>
      <Templates/>
    </div>
    </div>
  )
}

export default Home
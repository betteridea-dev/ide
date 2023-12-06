import { nextArrow } from "../assets"
import Templates from "../components/Templates"
import Recents from "../components/Recents"
import { tutorialFlow } from "../assets"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Home = ({ setShowSidebar }: { setShowSidebar: any }) => {
  setShowSidebar(true)
  return (
    <div className="pt-9 cursor-pointer w-full">
      <div className="flex p-2.5 w-fit text-left justify-center items-center gap-1.5 border-t border-white">
        <p>Resume working on a contract</p>
        <img className="pt-1" src={nextArrow} alt="more templates" />
      </div>
      <Recents />
      <div className="flex p-2.5 w-fit text-left justify-center items-center gap-1.5 border-t border-white">
        <p>Or start with a project template</p>
        <img className="pt-1" src={nextArrow} alt="more templates" />
      </div>
      <Templates />
      {/* demo of our application */}
      <div className="flex  p-2.5 w-fit text-left justify-center items-center gap-1.5 border-t border-white">
        <p>Confused? Take a tour</p>
        <img className="pt-1" src={nextArrow} alt="more templates" />
      </div>
      <div className=" w-full pt-4 p-10 absolute left-0">
        <img src={tutorialFlow} alt="Tutorial" />
      </div>
    </div>
  )
}

export default Home
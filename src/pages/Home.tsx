import { nextArrow } from "../assets"
import Templates from "../components/Templates"
import { Tour } from "../components/Tour"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Home = ({ setShowSidebar }: { setShowSidebar: any }) => {
  setShowSidebar(true)
  return (
    <div className=" pl-14 pt-9 cursor-pointer">
      <div className="w-full">
      <div className="flex p-2.5 w-fit text-left justify-center items-center gap-1.5 border-t border-white">
      <p>Start with a project template</p>
      <img className="pt-1" src={nextArrow} alt="more templates" />
      </div>
      <Templates/>
      {/* demo of our application */}
      <div className="flex  p-2.5 w-fit text-left justify-center items-center gap-1.5 border-t border-white">
      <p>Confused? Take a tour</p>
      <img className="pt-1" src={nextArrow} alt="more templates" />
      </div>
      <Tour/>
    </div>
    </div>
  )
}

export default Home
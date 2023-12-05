import Tabs from "../components/Tabs";

const Code = () => {
  return (
      <div className="flex">
        <Tabs/>
        <div className="flex pt-4 gap-1">
        <div className="pl-4 cursor-pointer">
          <div className="flex p-2.5 justify-center items-center gap-1.5 border-t border-white">
          <p>Contract.js</p>
        </div>
        </div>
        <div className="pl-4 cursor-pointer">
            <div className="flex p-2.5 justify-center items-center gap-1.5 ">
            <p>Wallet.json</p>
        </div>
        </div>
        </div>
      </div>
  )
}

export default Code;
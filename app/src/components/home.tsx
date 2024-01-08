export default function Home() {
    function ContractCard(){
        return <div className="ring-1 rounded ring-white/50 p-2 px-3 flex flex-col gap-2 hover:bg-white/5">
            <div className="text-lg">Contract name</div>
            <button className="relative bg-green-700/40 hover:bg-green-700/80 px-2 rounded hover:w-24 w-14 text-left transition-all duration-300">
                open
                <div className="absolute right-2 w-full text-right text-transparent hover:text-white top-0">-&gt;</div>
            </button>
        </div>
    }

    return <div className=" h-full flex flex-col gap-1 items-center justify-center">
        <div className="text-2xl">Welcome to BetterIDE! 🚀</div>
        <div className="text-lg">Your one stop solution for developing smart contracts on Arweave</div>

        <div className="flex flex-col gap-5 justify-start items-start w-full px-10">
            <div>
                <div className="text-xl my-1">Recently opened contracts</div>
                <div className="flex gap-3">
                    <ContractCard/>
                    <ContractCard/>
                    <ContractCard/>
                    <ContractCard/>
                </div>
            </div>
            <div>
                <div className="text-xl my-1">Explore contract templates</div>
                <div className="flex gap-3">
                    <ContractCard/>
                    <ContractCard/>
                    <ContractCard/>
                    <ContractCard/>
                </div>

            </div>
        </div>


    </div>
}

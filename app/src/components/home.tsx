import useContracts from "@/hooks/useContracts"
import { contractSrc as voteSrc, stateSrc as voteState } from "@/templates/warp/vote"
import { contractSrc as utokenSrc, stateSrc as utokenState } from "@/templates/warp/utoken"
import { contractSrc as dbSrc, stateSrc as dbState } from "@/templates/warp/db"

export default function Home() {
    const { newContract } = useContracts()

    function ContractCard({ name, src, state }: { name: string, src?: string, state?: string }) {
        return <div className="ring-1 rounded ring-white/50 p-2 px-3 flex flex-col gap-2 hover:bg-white/5">
            <div className="text-lg">{name}</div>
            <button className="relative bg-[#2c3b50] hover:bg-[#395d8b] px-2 rounded hover:w-24 w-14 text-left transition-all duration-300"
                onClick={() => {
                    newContract(src, state)
                }}
            >
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
                    <ContractCard />
                    <ContractCard />
                    <ContractCard />
                    <ContractCard />
                </div>
            </div>
            <div>
                <div className="text-xl my-1">Explore contract templates</div>
                <div className="flex gap-3">
                    <ContractCard name="Vote" src={voteSrc} state={voteState} />
                    <ContractCard name="Database" src={dbSrc} state={dbState} />
                    <ContractCard name="U-Token" src={utokenSrc} state={utokenState} />
                </div>

            </div>
        </div>


    </div>
}

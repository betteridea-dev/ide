import { ContractsType } from "~/hooks/useContracts";
import {
  contractSrc as voteSrc,
  stateSrc as voteState,
} from "../../templates/warp/vote";
import {
  contractSrc as utokenSrc,
  stateSrc as utokenState,
} from "../../templates/warp/utoken";
import {
  contractSrc as dbSrc,
  stateSrc as dbState,
} from "../../templates/warp/db";
import { useState } from "react";

export default function Home({
  contracts,
  setActiveMenuItem,
  setActiveContract,
  setActiveFile,
}: {
  contracts: ContractsType;
  setActiveMenuItem: (val: string) => void;
  setActiveContract: (val: string) => void;
  setActiveFile: (val: string) => void;
}) {
  const [recents] = useState<string[]>(
    JSON.parse(localStorage.getItem("recents")) || []
  );

  function ContractCard({
    name,
    src,
    state,
  }: {
    name: string;
    src?: string;
    state?: string;
  }) {
    return (
      <div className="ring-1 rounded ring-white/50 p-2 px-3 flex flex-col gap-2 hover:bg-white/5 min-w-[150px]">
        <div className="text-lg">{name}</div>
        <button
          className="relative bg-[#2c3b50] hover:bg-[#395d8b] px-2 rounded hover:w-24 w-14 text-left transition-all duration-300"
          onClick={() => {
            const r = [...recents];
            if (src && state) {
              const n = contracts.newContract(src, state);
              if (n) {
                setTimeout(() => {
                  setActiveContract(n);
                  setActiveFile("README.md");
                  setActiveMenuItem("Contracts");
                }, 400);

                if (r.includes(n)) {
                  r.splice(r.indexOf(n), 1);
                }
                r.unshift(n);
                localStorage.setItem("recents", JSON.stringify(r));
              }
            } else {
              setActiveContract(name);
              setActiveFile("README.md");
              setActiveMenuItem("Contracts");
              if (r.includes(name)) {
                r.splice(r.indexOf(name), 1);
              }
              r.unshift(name);
              localStorage.setItem("recents", JSON.stringify(r));
            }
          }}
        >
          {src && state ? "edit" : "open"}
          <div className="absolute right-2 w-full text-right text-transparent hover:text-white top-0">
            -&gt;
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className=" h-full flex flex-col gap-1 items-center justify-center">
      <div className="text-2xl">Welcome to BetterIDEa! 🚀</div>
      <div className="text-lg">
        Your one stop solution for developing smart contracts on Arweave
      </div>

      <div className="flex flex-col gap-5 justify-start items-start w-full px-10">
        <div>
          <div className="text-xl my-1">
            {recents.length == 0
              ? "No recently opened contracts"
              : "Recently opened contracts"}
          </div>
          <div className="flex gap-3">
            {recents.map((recent) => {
              return <ContractCard name={recent} />;
            })}
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
  );
}

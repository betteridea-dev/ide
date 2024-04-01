import { ContractsType } from "../../../hooks/useContracts";
import {
  contractSrc as voteSrc,
  stateSrc as voteState,
} from "../../../templates/warp/vote";
import {
  contractSrc as utokenSrc,
  stateSrc as utokenState,
} from "../../../templates/warp/utoken";
import {
  contractSrc as dbSrc,
  stateSrc as dbState,
} from "../../../templates/warp/db";
import { useState } from "react";
import { useAppDispatch } from "../../../hooks/store";
import {
  setActiveContract,
  setActiveFile,
  setActiveSideNavItem,
} from "@/store/app-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "../icons";

export default function Home({ contracts }: { contracts: ContractsType }) {
  const dispatch = useAppDispatch();

  const [recents] = useState<string[]>(
    JSON.parse(localStorage.getItem("recents")!) || []
  );

  function _setActiveFile(s: string) {
    dispatch(setActiveFile(s));
  }

  function setActiveMenuItem(s: string) {
    dispatch(setActiveSideNavItem(s));
  }

  function _setActiveContract(s: string) {
    setActiveContract(s);
  }

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
      <Card className="flex flex-col min-w-[160px] gap-3 p-3">
        <div className="text-lg">{name}</div>

        <Button
          className="group transition-all duration-300 relative"
          variant="secondary"
          onClick={() => {
            const r = [...recents];
            if (src && state) {
              const n = contracts.newContract(src, state);

              if (n) {
                setTimeout(() => {
                  _setActiveContract(n);
                  _setActiveFile("README.md");
                  setActiveMenuItem("Contracts");
                }, 400);

                if (r.includes(n)) {
                  r.splice(r.indexOf(n), 1);
                }
                r.unshift(n);
                localStorage.setItem("recents", JSON.stringify(r));
              }
            } else {
              _setActiveContract(name);
              _setActiveFile("README.md");
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

          <Icons.arrowRight className="absolute right-2 hidden group-hover:block" />
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <div className="text-2xl">Welcome to BetterIDEa! 🚀</div>

      <div className="text-lg">
        Your one stop solution for developing smart contracts on Arweave
      </div>

      <div className="h-12"></div>

      <div className="flex w-full flex-col items-start justify-start gap-5 px-10">
        <div>
          <div className="my-3 text-xl">
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
          <div className="my-3 text-xl">Explore contract templates</div>

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

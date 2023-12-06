import { useEffect, useState } from "react";
import { search } from "../assets";
import { viewContractState } from "arweavekit";

const prodPland = "xTX-43_CthP27lagLSQh-dKRznufGrsyBerwvU3BaRc";
const plandAddress = "dlRq8Tlmt5NnfjwEApwDRfJYz0OKcIbQF8O_UifHHYs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GlobalCloud = ({ setShowSidebar }: { setShowSidebar: any }) => {
  setShowSidebar(true)
  const [repositories, setRepositories] = useState<object>({})

  useEffect(() => {
    async function getStateAndReadAllRepos() {
      const txn = await viewContractState({
        environment: "local",
        contractTxId: plandAddress,
        strategy: "arweave",
        options: {
          function: "getRepositoriesByOwner",
          payload: {
            "owner": "XDOqw28LKTa2wSechfMUmBU7PfLl1Q3C3RyZ_bNogWE"
          }
        }
      })
      if (txn.result.status == 200) {
        console.log("repos", txn.viewContract.state.repos)
        setRepositories(txn.viewContract.state.repos)
      }
    }
    getStateAndReadAllRepos()
  }, [])

  return (
    <>
      <div className="text-center text-3xl my-5">Explore other developers contracts</div>
      <div className="flex flex-col items-center gap-5  justify-center w-full mt-3 mb-7">
        {/* search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2">
            <img src={search} alt="search" />
          </div>
          <input
            type="text"
            className="pl-10  w-[817px] bg-transparent pr-4 py-2 border border-gray-300 rounded-full outline-none"
            placeholder="Search"
          />
        </div>
        <div>
        </div>
      </div>
      {/* main section */}
      <div className="grid grid-cols-3 mr-5 gap-2">
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.keys(repositories).map((repo: any, i) => {
            return (
              <div className="ring-1 ring-white rounded p-1 px-2">
                <div className="flex items-center col-span-3">
                  <div className="items-center gap-2.5">
                    <p className="text-xl font-semibold">{repositories[repo].name}</p>
                    <p className="text-md text-white/60 font-medium">{repositories[repo].description}</p>
                    <p className="text-xs text-white/60 font-medium overflow-clip my-2">by {(repositories[repo].owner as string).substring(0, 5)}...{(repositories[repo].owner as string).substring((repositories[repo].owner as string).length - 5, (repositories[repo].owner as string).length)}
                    </p>
                  </div>
                </div>
                <div className="text-lg">{repositories[repo].contract}</div>
                <div className="text-lg">
                  <div className="inline-flex items-center gap-4  rounded px-3 py-[6px]">
                    <button className="text-black text-sm font-normal font-inter bg-[#46A5FD] p-1 px-2 rounded">preview</button>
                    <button className="text-black text-sm font-normal font-inter bg-[#46fd68] p-1 px-2 rounded" onClick={(e) => {
                      e.preventDefault()

                    }}>import</button>
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    </>
  )
}

export default GlobalCloud;
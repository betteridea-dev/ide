import { createTransaction } from "arweavekit"
import { writeContract, viewContractState } from "arweavekit/contract"
import JSZip from "jszip"
import { useEffect, useState } from "react"
import { v4 } from "uuid"
import { useConnection, useActiveAddress } from "arweave-wallet-kit"
import axios from "axios"

type cdata = {
  [key: string]: {
    [key: string]: string
  }
}

const prodPland = "xTX-43_CthP27lagLSQh-dKRznufGrsyBerwvU3BaRc";

// keep updating after deployment
const plandAddress = "dlRq8Tlmt5NnfjwEApwDRfJYz0OKcIbQF8O_UifHHYs";

import { search } from "../assets"


const PeronalProjects = ({ setShowSidebar }: { setShowSidebar: any }) => {
  setShowSidebar(true)
  const [contracts, setContracts] = useState<cdata>({})
  const [repositories, setRepositories] = useState<object[]>([])
  const [repoNames, setRepoNames] = useState<string[]>([])
  const { connected, connect, disconnect } = useConnection()
  const activeAddress = useActiveAddress()

  useEffect(() => {
    const c = localStorage.getItem("contracts")
    if (c) {
      const parsed = JSON.parse(c)
      setContracts(parsed)
    }
  }, [])

  useEffect(() => {
    if (connected)
      fetchUserRepos()
  }, [activeAddress, connected])

  async function fetchUserRepos() {
    console.log(activeAddress)
    const txn = await viewContractState({
      environment: "local",
      contractTxId: plandAddress,
      strategy: "arweave",
      options: {
        function: "getRepositoriesByOwner",
        payload: {
          owner: activeAddress
        }
      }
    })
    console.log(txn)
    if (txn.result.status == 200) {
      const repos = txn.viewContract.result
      console.log("repos", repos)
      setRepositories(repos)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRepoNames(repos.map((repo: any) => repo.name))
    }
  }

  function newRepo(e: any, file: string) {
    e.stopPropagation()
    const zip = new JSZip()
    // zip.file("contract.js", contracts[file]["contract.js"])
    // zip.file("state.json", contracts[file]["state.json"])
    for (const key in contracts[file]) {
      zip.file(key, contracts[file][key])
    }
    zip.generateAsync({ type: "arraybuffer" }).then(async function (content) {
      // file upload txn
      const txn = await createTransaction({
        data: content,
        type: "data",
        environment: "local",
        options: { signAndPost: true }
      })
      console.log(txn)
      if (txn.postedTransaction.status == 200) {
        // update protocol land create repo
        const createRepoTxn = await writeContract({
          wallet: "use_wallet",
          environment: "local",
          contractTxId: plandAddress,
          options: {
            function: "initialize",
            payload: {
              name: file,
              description: "sample desc",
              dataTxId: txn.transaction.id,
              id: v4(),
            }
          }
        })
        console.log(createRepoTxn)
        fetchUserRepos()
      }
    })
  }

  async function importRepo(id: string) {
    if (id in contracts) return alert("repo already imported")
    if (!(id in repositories)) return alert("repo not found")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repo: any = repositories.find((repo: any) => repo.id == id)
    console.log(repo)
    if (!repo) return alert("repo not found")

    const dataTxId = repo.dataTxId
    const zipUrl = `http://localhost:1984/${dataTxId}`
    async function get(url: string) {
      const { data } = await axios({
        method: 'GET',
        url: url,
        responseType: "arraybuffer"
      });
      return data;
    }
    async function getAndUnZip(url: string) {
      const zipFileBuffer = await get(url);
      console.log(zipFileBuffer)
      const zip = await JSZip.loadAsync(zipFileBuffer)
      console.log(zip.files)
      const c = zip.file("contract.js")?.async("string")
      const s = zip.file("state.json")?.async("string")
      const [csrc, ssrc] = await Promise.all([c, s])
      console.log(csrc, ssrc)
      if (!csrc || !ssrc) return alert("invalid repo")
      const cdata = {
        ...contracts,
        [repo.name]: {
          "contract.js": csrc,
          "state.json": ssrc
        }
      }
      localStorage.setItem("contracts", JSON.stringify(cdata))
      setContracts(cdata)

    }
    getAndUnZip(zipUrl)
  }

  function auth() {
    if (connected)
      disconnect()
    else
      connect()
  }

  const Item = () => {
    return <>
      <div className="col-span-3">name</div>
      <div>local</div>
      <div>btn</div>
    </>
  }

  return (
    <>
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
        <button onClick={auth}>{connected ? `Cloud for ${activeAddress}` : "connect"}</button>
        <div>
          {/* button */}
          {/* <div className="inline-flex items-center gap-2.5 bg-cyan-950 rounded px-3 py-[6px]">
          <button className="text-white text-sm font-normal font-inter">+ new project</button>
        </div> */}
          <div className="grid grid-cols-5 px-5 gap-2">
            <div className="col-span-3 text-xl">Contract</div><div className="text-xl">Location</div><div className="text-xl">Upload options</div>
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              repositories.map((repo: any, i) => {
                return (
                  <>
                    <div className="flex items-center col-span-3">
                      <p>{repo.name}</p>
                    </div>
                    <div>{repo.name in contracts ? "Local & Cloud" : "Cloud"}</div>
                    <div className="flex items-center">
                      {repo.name in contracts ? <button className="px-2 py-1 mr-2 text-sm text-white bg-[#fd4646] rounded-md">Push Updates</button> : <button className="px-2 py-1 mr-2 text-sm text-white bg-green-500 rounded-md" onClick={() => importRepo(repo.id)}>Import</button>}
                    </div>
                  </>
                )
              })
            }
            {
              Object.keys(contracts).map((contract, i) => {
                if (!repoNames.includes(contract)) return (
                  <>
                    <div className="flex items-center col-span-3">
                      <p>{contract}</p>
                    </div>
                    <div>
                      <p>local</p>
                    </div>
                    <div className="flex items-center">
                      <button className="px-2 py-1 mr-2 text-sm text-white bg-[#46A5FD] rounded-md" onClick={(e) => newRepo(e, contract)}>Save to Cloud</button>
                    </div>
                  </>
                )
              })
            }
          </div>
        </div>
      </div>
      {/* main section */}



    </>
  )
}

export default PeronalProjects
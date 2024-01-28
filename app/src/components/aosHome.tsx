import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Combobox } from "./ui/combo-box";
import { gql, GraphQLClient } from "graphql-request";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { AOModule, AOScheduler } from "../../config";

export default function AosHome({ setActiveMenuItem }: { setActiveMenuItem: (val: string) => void }) {
  const [myProcesses, setMyProcesses] = useState<string[]>([]);
  const [spawning, setSpawning] = useState(false);


  useEffect(() => {
    const client = new GraphQLClient("https://arweave.net/graphql");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = gql`
      query ($address: [String!]!) {
        transactions(
          owners: $address
          tags: [
            { name: "Data-Protocol", values: ["ao"] }
            { name: "Type", values: ["Process"] }
          ]
        ) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;
    async function fetchProcesses() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const address = await (window as any).arweaveWallet.getActiveAddress();
      const res = await client.request(query, { address });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMyProcesses(
        (res as any).transactions.edges.map((edge: any) => edge.node.id)
      );
    }
    fetchProcesses();
  }, []);

  async function spawnProcess() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (window as any).arweaveWallet.connect([
      "ACCESS_ADDRESS",
      "SIGN_TRANSACTION",
    ]);
    setSpawning(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signer = createDataItemSigner((window as any).arweaveWallet);
    console.log(signer);
    const res = await connect().spawn({
      module: AOModule,
      scheduler: AOScheduler,
      signer,
      tags: [],
    });
    console.log(res);
    setMyProcesses((prev) => [res, ...prev]);
    localStorage.setItem("activeProcess", res);
    setActiveMenuItem("Notebook");
    setSpawning(false);
  }

  return (
    <div className="h-full flex flex-col gap-2 items-center justify-evenly">
      <h1 className="text-2xl tracking-tight">
        <span className="italic font-light mr-1">
          Unlock Infinite Creativity with{" "}
        </span>
        <span className="bg-gradient-to-r from-[#006F86] to-white bg-clip-text text-transparent font-bold not-italic">
          AO notebook&apos;s threaded computer
        </span>
      </h1>

      <div className="w-full max-w-xl flex flex-col gap-8">
        <h3 className="text-xl font-bold">Your Processes</h3>

        <div className="flex gap-3 items-center">
          <Combobox options={myProcesses} onChange={(e) => {
            localStorage.setItem("activeProcess", e);
            console.log(e)
            setActiveMenuItem("Notebook")
          }} />
          <span>or</span>
          <Button disabled={spawning} onClick={spawnProcess}>Create new process</Button>
        </div>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-8">
        <h3 className="text-xl font-bold italic">Explore templates</h3>

        <div className="grid grid-cols-3 gap-2">
          {["Chatroom", "Token", "Ping Pong"].map((label, i) => (
            <Button>{label}</Button>
          ))}
        </div>
      </div>

      <Button variant="secondary">Start new process</Button>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { gql, GraphQLClient } from "graphql-request";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { AOModule, AOScheduler } from "../../../config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch } from "../../../hooks/store";
import { setActiveSideNavItem } from "@/store/app-store";

const templates: { [a: string]: string } = {
  chat: "/?getcode=tXTL4xmTgBWPhdcnG58zgxGdbLK1tCms_k5rrAHe1SE",
  token: "/?getcode=Vx0OaXCQV8dd87CiZSxm2dbH8Sn66_bsCzj_1y1BAjo",
  voting: "/?getcode=n8kHWl8s3n_6aQSUuURvUBUU16gEjYBU8_x4pANSbjs",
};

export default function AOHome() {
  const dispatch = useAppDispatch();
  const [myProcesses, setMyProcesses] = useState<string[]>([]);
  const [spawning, setSpawning] = useState(false);

  useEffect(() => {
    const client = new GraphQLClient("https://arweave.net/graphql");

    const query = gql`
      query ($address: [String!]!) {
        transactions(owners: $address, tags: [{ name: "Data-Protocol", values: ["ao"] }, { name: "Type", values: ["Process"] }]) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    async function fetchProcesses() {
      const address = await window.arweaveWallet.getActiveAddress();
      console.log(address);
      const res = await client.request(query, { address });
      console.log(res);
      setMyProcesses(res.transactions.edges.map((edge: any) => edge.node.id));
    }

    fetchProcesses();
  }, []);

  async function spawnProcess() {
    // await window.arweaveWallet.connect([
    //   "ACCESS_ADDRESS",
    //   "SIGN_TRANSACTION",
    // ]);
    setSpawning(true);
    const signer = createDataItemSigner(window.arweaveWallet);
    console.log(signer);
    const res = await connect().spawn({
      module: AOModule,
      scheduler: AOScheduler,
      signer,
      tags: [
        {
          name: "App-Name",
          value: "BetterIDEa",
        },
      ],
    });
    console.log(res);
    setMyProcesses((prev) => [res, ...prev]);
    localStorage.setItem("activeProcess", res);

    dispatch(setActiveSideNavItem("Notebook"));

    setSpawning(false);
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-24">
      <h1 className="text-3xl tracking-tight">
        <span className="mr-1 font-light italic">Unlock Infinite Creativity with </span>
        <span className="bg-gradient-to-r from-[#006F86] to-white bg-clip-text font-bold not-italic text-transparent">AO notebook&apos;s threaded computer</span>
      </h1>

      <div className="flex w-full max-w-xl flex-col gap-3">
        <h3 className="text-xl font-bold">Your Processes</h3>

        <div className="flex flex-row items-center gap-3">
          <Select
            disabled={myProcesses.length === 0 || spawning}
            onValueChange={(val) => {
              localStorage.setItem("activeProcess", val);
              dispatch(setActiveSideNavItem("Notebook"));
            }}
          >
            <SelectTrigger className="max-w-full flex-grow">
              <SelectValue placeholder={spawning ? "Spawning..." : "Process ID"} />
            </SelectTrigger>

            <SelectContent>
              {myProcesses.map((process) => (
                <SelectItem value={process} key={process}>
                  {process}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>OR</div>

          <Button disabled={spawning} onClick={spawnProcess}>
            {spawning ? "spawning new process..." : "Create New Process"}
          </Button>
        </div>
      </div>

      <div className="flex w-full max-w-xl flex-col gap-3">
        <h3 className="text-xl font-bold">Explore templates</h3>

        <div className="grid grid-cols-3 gap-2">
          {/* {["Chatroom", "Token", "Ping Pong"].map((label, i) => (
            <Button key={i}>{label}</Button>
          ))} */}
          {Object.keys(templates).map((label, i) => {
            return (
              <Button
                key={i}
                onClick={() => {
                  window.open(templates[label]);
                }}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

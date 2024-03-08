import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { gql, GraphQLClient } from "graphql-request";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { AOModule, AOScheduler } from "../../config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const templates = {
  chat: "/?getcode=tXTL4xmTgBWPhdcnG58zgxGdbLK1tCms_k5rrAHe1SE",
  token: "/?getcode=Vx0OaXCQV8dd87CiZSxm2dbH8Sn66_bsCzj_1y1BAjo",
  voting: "/?getcode=n8kHWl8s3n_6aQSUuURvUBUU16gEjYBU8_x4pANSbjs",
};

export default function AosHome({
  setActiveMenuItem,
}: {
  setActiveMenuItem: (val: string) => void;
}) {
  const [myProcesses, setMyProcesses] = useState<string[]>([]);
  const [spawning, setSpawning] = useState(false);
  // const [connected, setConnected] = useState(false);

  // useEffect(() => {
  //   (async () => {
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     const wallet = (window as any).arweaveWallet;
  //     if (wallet) {
  //       if (await wallet.getActiveAddress()) {
  //         setConnected(true);
  //       } else {
  //         // await wallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
  //         // setConnected(true);
  //         setConnected(false)
  //       }
  //     } else {
  //       alert("Please install the ArConnect extension")
  //     }
  //   })();
  // }, [])

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
      console.log(address);
      const res = await client.request(query, { address });
      console.log(res);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMyProcesses(
        (res as any).transactions.edges.map((edge: any) => edge.node.id)
      );
    }

    fetchProcesses();
  }, []);

  async function spawnProcess() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // await (window as any).arweaveWallet.connect([
    //   "ACCESS_ADDRESS",
    //   "SIGN_TRANSACTION",
    // ]);
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
    <div className="h-full flex flex-col gap-24 items-center justify-center">
      <h1 className="text-3xl tracking-tight">
        <span className="italic font-light mr-1">
          Unlock Infinite Creativity with{" "}
        </span>
        <span className="bg-gradient-to-r from-[#006F86] to-white bg-clip-text text-transparent font-bold not-italic">
          AO notebook&apos;s threaded computer
        </span>
      </h1>

      <div className="w-full max-w-xl flex flex-col gap-3">
        <h3 className="text-xl font-bold">Your Processes</h3>

        <div className="flex flex-row gap-3 items-center">
          <Select
            disabled={myProcesses.length === 0 || spawning}
            onValueChange={(val) => {
              localStorage.setItem("activeProcess", val);
              setActiveMenuItem("Notebook");
            }}
          >
            <SelectTrigger className="flex-grow max-w-full">
              <SelectValue
                placeholder={spawning ? "Spawning..." : "Process ID"}
              />
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

      <div className="w-full max-w-xl flex flex-col gap-3">
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

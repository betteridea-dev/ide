import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { createDataItemSigner as nodeCDIS } from "@permaweb/aoconnect/node";

export const AppVersion = "3.0.0";
export const AOModule = "nI_jcZgPd0rcsnjaHtaaJPpMCW847ou-3RGA5_W3aZg";
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

export const APM_ID = "UdPDhw5S7pByV3pVqwyr1qzJ8mR8ktzi9olgsdsyZz4";

export const BetterIDEaWallet = "MnZ8JrR5SoswAwWtX-HTnl4Kq5k6Kx1Y7vPxmlAyl_g"
export const SponsorWebhookUrl = "https://discord.com/api/webhooks/1258731411033030726/T6rl7Ciuw8cgiR30MOVeOsbEcvAEWM45IRpc37TqAoXBbH3ZQDoxQzLAW0bmgcsxnCI9"

export const modules = {
  "Default (WASM64)": AOModule,
  "SQLite64": "u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54",
  "WASM32 (old)": "1PdCJiXhNafpJbvC-sjxWTeNzbf9Q_RfUNs84GYoPm0",
  "SQLite32 (old)": "GYrbbe0VbHim_7Hi6zrOpHQXrSQz07XNtwCnfbFo2I0",
};

const CommonTags = [
  { name: "App-Name", value: "BetterIDEa" },
  { name: "App-Version", value: AppVersion },
];

export type Tag = { name: string; value: string };

// db parsed
export type Column = {
  name: string
  dataType: string
}

export type TPackage = {
  Description: string;
  Installs: number;
  Name: string;
  Owner: string;
  PkgID: string;
  RepositoryUrl: string;
  Updated: number;
  Vendor: string;
  Version: string;
  README: string;
  Items: string;
}

export async function spawnProcess(name?: string, tags?: Tag[], newProcessModule?: string) {
  const ao = connect();

  if (tags) {
    tags = [...CommonTags, ...tags];
  } else {
    tags = CommonTags;
  }
  tags = name ? [...tags, { name: "Name", value: name }] : tags;

  const result = await ao.spawn({
    module: newProcessModule ? newProcessModule : AOModule,
    scheduler: AOScheduler,
    tags,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
  });

  return result;
}

export async function runLua(code: string, process: string, tags?: Tag[]) {
  const ao = connect();

  if (tags) {
    tags = [...CommonTags, ...tags];
  } else {
    tags = CommonTags;
  }

  // if (!window.arweaveWallet) {
  //   const dryMessage = await ao.dryrun({
  //     process,
  //     data: code,
  //     tags,
  //   });
  //   return dryMessage
  // }

  tags = [...tags, { name: "Action", value: "Eval" }];

  const message = await ao.message({
    process,
    data: code,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
    tags,
  });

  const result = await ao.result({ process, message });
  // console.log(result);
  return result;
}

export async function getResults(process: string, cursor = "") {
  const ao = connect();

  const r = await ao.results({
    process,
    from: cursor,
    sort: "ASC",
    limit: 999999,
  });

  if (r.edges.length > 0) {
    const newCursor = r.edges[r.edges.length - 1].cursor;
    const results = r.edges.map((e) => e.node);
    return { cursor: newCursor, results };
  } else {
    return { cursor, results: [] };
  }
}

export function parseOutupt(out: any) {
  if (!out.Output) return out;
  const data = out.Output.data;
  const { json, output } = data;
  if (json != "undefined") {
    return json;
  }
  try {
    return JSON.parse(output);
  } catch (e) {
    return output;
  }
}

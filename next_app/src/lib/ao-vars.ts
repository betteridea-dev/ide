import { connect, createDataItemSigner } from "@permaweb/aoconnect";

const AppVersion = "3.0.0";
export const AOModule = "1PdCJiXhNafpJbvC-sjxWTeNzbf9Q_RfUNs84GYoPm0";
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

const CommonTags = [
  { name: "App-Name", value: "BetterIDEa" },
  { name: "App-Version", value: AppVersion },
];

type Tags = { name: string, value: string }[];

export async function spawnProcess(name?: string, tags?: Tags, newProcessModule?: string) {
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
    signer: createDataItemSigner(window.arweaveWallet),
  });

  return result;
}

export async function runLua(code: string, process: string, tags?: Tags) {
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
    signer: createDataItemSigner(window.arweaveWallet),
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
    limit: 999,
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
  const { json, output } = data
  if (json != "undefined") {
    return json;
  }
  try {
    return JSON.parse(output);
  } catch (e) {
    return output;
  }
}
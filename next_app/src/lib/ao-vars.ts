import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { createDataItemSigner as nodeCDIS } from "@permaweb/aoconnect/node";

export const AppVersion = "3.0.0";
export const AOModule = "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM"; // aos 2.0.1
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

export const APM_ID = "DKF8oXtPvh3q8s0fJFIeHFyHNM6oKrwMCUrPxEMroak";

export const BetterIDEaWallet = "MnZ8JrR5SoswAwWtX-HTnl4Kq5k6Kx1Y7vPxmlAyl_g"
export const SponsorWebhookUrl = "https://discord.com/api/webhooks/1258731411033030726/T6rl7Ciuw8cgiR30MOVeOsbEcvAEWM45IRpc37TqAoXBbH3ZQDoxQzLAW0bmgcsxnCI9"

export const BAZAR = {
  // module: 'Pq2Zftrqut0hdisH_MC2pDOT6S4eQFoxGsFUzR6r350',
  // scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
  assetSrc: 'Fmtgzy1Chs-5ZuUwHpQjQrQ7H7v1fjsP0Bi8jVaDIKA',
  defaultToken: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
  ucm: 'U3TjJAZWJjlWBB4KAXSHKzuky81jtyh0zqH8rUL4Wd0',
  pixl: 'DM3FoZUq_yebASPhgd8pEIRIzDW6muXEhxz5-JwbZwo',
  collectionsRegistry: 'TFWDmf8a3_nw43GCm_CuYlYoylHAjCcFGbgHfDaGcsg',
  collectionSrc: '2ZDuM2VUCN8WHoAKOOjiH4_7Apq0ZHKnTWdLppxCdGY',
  profileRegistry: 'SNy4m-DrqxWl01YqGM4sxI8qCni-58re8uuJLvZPypY',
  profileSrc: '_R2XYWDPUXVvQrQKFaQRvDTDcDwnQNbqlTd_qvCRSpQ',
};

export const BAZAR_TAGS = {
  keys: {
    ans110: {
      title: 'Title',
      description: 'Description',
      topic: 'Topic:*',
      type: 'Type',
      implements: 'Implements',
      license: 'License',
    },
    appName: 'App-Name',
    avatar: 'Avatar',
    banner: 'Banner',
    channelTitle: 'Channel-Title',
    collectionId: 'Collection-Id',
    collectionName: 'Collection-Name',
    contentLength: 'Content-Length',
    contentType: 'Content-Type',
    contractManifest: 'Contract-Manifest',
    contractSrc: 'Contract-Src',
    creator: 'Creator',
    currency: 'Currency',
    dataProtocol: 'Data-Protocol',
    dataSource: 'Data-Source',
    dateCreated: 'Date-Created',
    handle: 'Handle',
    initState: 'Init-State',
    initialOwner: 'Initial-Owner',
    license: 'License',
    name: 'Name',
    profileCreator: 'Profile-Creator',
    profileIndex: 'Profile-Index',
    protocolName: 'Protocol-Name',
    renderWith: 'Render-With',
    smartweaveAppName: 'App-Name',
    smartweaveAppVersion: 'App-Version',
    target: 'Target',
    thumbnail: 'Thumbnail',
    topic: (topic: string) => `topic:${topic}`,
    udl: {
      accessFee: 'Access-Fee',
      commercialUse: 'Commercial-Use',
      dataModelTraining: 'Data-Model-Training',
      derivations: 'Derivations',
      paymentAddress: 'Payment-Address',
      paymentMode: 'Payment-Mode',
    },
  },
  values: {
    ansVersion: 'ANS-110',
    collection: 'AO-Collection',
    comment: 'comment',
    document: 'Document',
    followDataProtocol: 'Follow',
    license: 'dE0rmDfl9_OWjkDznNEXHaSO_JohJkRolvMzaCroUdw',
    licenseCurrency: 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
    profileVersions: { '1': 'Account-0.3' },
    ticker: 'ATOMIC ASSET',
    title: (title: string) => `${title}`,
  },
};

export const modules = {
  "AOS 2 (Default)": AOModule,
  // "AOS 0.2.1": "cNlipBptaF9JeFAf4wUmpi43EojNanIBos3EfNrEOWo",
  "SQLite64 (AOS 2)": "2qIQBC_mo5ywHZcTbC3Z-OTqyzserEhHAXscCjqOc1k",
  "SQLite64 (AOS 1)": "u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54",
  "WASM32 (old)": "1PdCJiXhNafpJbvC-sjxWTeNzbf9Q_RfUNs84GYoPm0",
  "SQLite32 (old)": "GYrbbe0VbHim_7Hi6zrOpHQXrSQz07XNtwCnfbFo2I0",
}

const CommonTags = [
  { name: "App-Name", value: "BetterIDEa" },
  { name: "App-Version", value: AppVersion },
];

export type Tag = { name: string; value: string };

// db parsed
export type Column = {
  name: string;
  pk: number;
  cid: number;
  notnull: number;
  type: string;
}
export type TDependencies = {
  [key: string]: {
    "version": string
  }
}
export type TPackage = {
  ID: string
  Vendor: string
  Name: string
  Version: string
  Versions?: string[]
  Description: string
  Owner: string
  Readme: string
  PkgID: string
  Source: string
  Authors: string[] | string
  Dependencies: TDependencies | string
  Repository: string
  Timestamp: number
  Installs: number
  TotalInstalls: number
  Keywords: string[]
  IsFeatured: boolean
  Warnings: {
    modifiesGlobalState: boolean
    installMessage: string
  } | string
  License: string
  Main?: string
  ////////////
  installed: boolean
}

export async function spawnProcess(name?: string, tags?: Tag[], newProcessModule?: string) {
  const ao = connect();

  if (tags) {
    tags = [...CommonTags, ...tags];
  } else {
    tags = CommonTags;
  }
  tags = name ? [...tags, { name: "Name", value: name }] : tags;
  tags = [...tags, { name: 'Authority', value: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY' }];

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
  (result as any).id = message;
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

export async function monitor(process: string) {
  const ao = connect();

  const r = await ao.monitor({
    process,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
  });

  return r;
}

export async function unmonitor(process: string) {
  const ao = connect();

  const r = await ao.unmonitor({
    process,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : nodeCDIS(window.arweaveWallet),
  });

  return r;
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

export async function readHandler(args: {
  processId: string;
  action: string;
  tags?: Tag[];
  data?: any;
}): Promise<any> {
  const ao = connect();
  const tags = [{ name: 'Action', value: args.action }];
  if (args.tags) tags.push(...args.tags);
  let data = JSON.stringify(args.data || {});

  const response = await ao.dryrun({
    process: args.processId,
    tags: tags,
    data: data,
  });

  if (response.Messages && response.Messages.length) {
    if (response.Messages[0].Data) {
      return JSON.parse(response.Messages[0].Data);
    } else {
      if (response.Messages[0].Tags) {
        return response.Messages[0].Tags.reduce((acc: any, item: any) => {
          acc[item.name] = item.value;
          return acc;
        }, {});
      }
    }
  }
}

export async function getBlueprints(): Promise<string[] | undefined> {
  const endpoint = "https://api.github.com/repos/permaweb/aos/contents/blueprints";

  const res = await fetch(endpoint);
  if (res.ok) {
    const data = await res.json() as { name: string }[];
    return data.map(d => d.name);
  } else {
    return undefined;
  }
}

export async function getRawBlueprint(path: string) {
  const endpoint = `https://raw.githubusercontent.com/permaweb/aos/main/blueprints/${path}`;

  const res = await fetch(endpoint);
  if (res.ok) {
    return await res.text();
  } else {
    return undefined;
  }
}
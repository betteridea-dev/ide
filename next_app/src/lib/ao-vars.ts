import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { transpileLuaX } from "jsx-lua-transpiler"
// import { createDataItemSigner as nodeCDIS } from "@permaweb/aoconnect/node";

// import { createData, ArweaveSigner, DataItem } from 'warp-arbundles'
import { createData, ArweaveSigner, DataItem } from "@dha-team/arbundles/web"


export function createDataItemSignerManual(wallet) {
  const newSigner = async (create, createDataItem = (buf) => new DataItem(buf)) => {
    console.log("create", create)
    console.log("createDataItem", createDataItem)

    const { data, tags, target, anchor } = await create({ alg: 'rsa-v1_5-sha256', passthrough: true })
    return signer({ data, tags, target, anchor })
  }
  const signer = async ({ data, tags, target, anchor }) => {
    console.log("data", data)
    console.log("tags", tags)
    console.log("target", target)
    console.log("anchor", anchor)
    const signer = new ArweaveSigner(wallet)
    const dataItem = createData(data, signer, { tags, target, anchor })
    return dataItem.sign(signer)
      .then(async () => ({
        id: await dataItem.id,
        raw: await dataItem.getRaw()
      }))
  }

  return newSigner
}

export const AppVersion = process.env.version;
export const AOModule = "JArYBF-D8q2OmZ4Mok00sD2Y_6SYEQ7Hjx-6VZ_jl3g"; // aos 2.0.3
export const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

export const APM_ID = "DKF8oXtPvh3q8s0fJFIeHFyHNM6oKrwMCUrPxEMroak";

export const BetterIDEaWallet = "MnZ8JrR5SoswAwWtX-HTnl4Kq5k6Kx1Y7vPxmlAyl_g"

export const DEFAULT_CU_URL = "https://cu.ao-testnet.xyz";
export const DEFAULT_MU_URL = "https://mu.ao-testnet.xyz";
// export const DEFAULT_CU_URL = "https://cu.ardrive.io";
export const DEFAULT_GATEWAY_URL = "https://arweave.net";

// deleted the webhook coz someone spammed it with woke stuff, can't have good things :(
export const SponsorWebhookUrl = "https://discord.com/api/webhooks/1258731411033030726/T6rl7Ciuw8cgiR30MOVeOsbEcvAEWM45IRpc37TqAoXBbH3ZQDoxQzLAW0bmgcsxnCI9"

export const modules = {
  "AOS 2.0.3 (Default)": AOModule,
  // "AOS 0.2.1": "cNlipBptaF9JeFAf4wUmpi43EojNanIBos3EfNrEOWo",
  "SQLite64": "33d-3X8mpv6xYBlVB-eXMrPfH5Kzf6Hiwhcv0UA10sw", // aos 2.0.3 sqlite module
  // "SQLite64 (AOS 1)": "u1Ju_X8jiuq4rX9Nh-ZGRQuYQZgV2MKLMT3CZsykk54",
  // "WASM32 (old)": "1PdCJiXhNafpJbvC-sjxWTeNzbf9Q_RfUNs84GYoPm0",
  // "SQLite32 (old)": "GYrbbe0VbHim_7Hi6zrOpHQXrSQz07XNtwCnfbFo2I0",
  "AOLearn": "qG-uo90351vUF7WPmUcObFtk7NU1isZYdPS0r2yQdKY",
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

const processHtml = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://tailwind_betteridea.ar.io"></script>
    <script type="module">
        import { aofetch } from "https://unpkg.com/ao-fetch@latest/dist/browser.mjs";

        const process = window.location.pathname.split("/")[1];
        const path = "/" + window.location.pathname.split("/").splice(2).join("/");
        window.process = process;
        window.path = path;

        console.log(process, path);

        try {
            const res = await aofetch(process + path);
            if (res && res.status == 200) {
                console.log(res);
                try {
                    const body = document.querySelector("body");
                    let json;
                    try {
                        json = JSON.parse(res.text);
                        // Add meta tags if not present
                        const head = document.querySelector('head');
                        if (!document.querySelector('meta[name="color-scheme"]')) {
                            const metaColor = document.createElement('meta');
                            metaColor.setAttribute('name', 'color-scheme');
                            metaColor.setAttribute('content', 'light dark');
                            head.appendChild(metaColor);
                        }
                        if (!document.querySelector('meta[charset]')) {
                            const metaCharset = document.createElement('meta');
                            metaCharset.setAttribute('charset', 'utf-8');
                            head.appendChild(metaCharset);
                        }
                        // Render JSON and add formatter container
                        body.innerHTML = \`<pre>\${JSON.stringify(json, null, 2)}</pre><div class="json-formatter-container"></div>\`;
                    } catch (e) {
                        body.innerHTML = res.text;
                    }
                } catch (e) {
                    console.error("aofetch error:", e);
                    const body = document.querySelector("body");
                    body.innerHTML = "<h1>error</h1>";
                }
            } else {
                console.error(res)
            }
        } catch (e) {
            console.error("aofetch error:", e);
            const body = document.querySelector("body");
            body.innerHTML = "<h1>error</h1>";
        }
    </script>
</head>

<body></body>

</html>`

export function getCustomUrls(): { cu: string, mu: string, gateway: string } {
  const customCU = JSON.parse(localStorage.getItem("ao-cu-url") || `""`) || DEFAULT_CU_URL;
  const customMU = JSON.parse(localStorage.getItem("ao-mu-url") || `""`) || DEFAULT_MU_URL;
  const customGateway = JSON.parse(localStorage.getItem("ao-gateway-url") || `""`) || DEFAULT_GATEWAY_URL;

  try { new URL(customCU) } catch (e) { console.error("Invalid custom cu url", e) }
  try { new URL(customMU) } catch (e) { console.error("Invalid custom mu url", e) }
  try { new URL(customGateway) } catch (e) { console.error("Invalid custom gateway url", e) }

  if (customCU != DEFAULT_CU_URL) console.log("Using custom cu url", customCU)
  if (customMU != DEFAULT_MU_URL) console.log("Using custom mu url", customMU)
  if (customGateway != DEFAULT_GATEWAY_URL) console.log("Using custom gateway url", customGateway)

  return { cu: customCU, mu: customMU, gateway: customGateway };
}

export async function spawnProcess(name?: string, tags?: Tag[], newProcessModule?: string) {
  const { cu, mu, gateway } = getCustomUrls();
  const ao = connect({ MODE: "legacy", CU_URL: cu, MU_URL: mu, GATEWAY_URL: gateway });

  if (tags) {
    tags = [...CommonTags, ...tags];
  } else {
    tags = CommonTags;
  }
  tags = name ? [...tags, { name: "Name", value: name }] : tags;
  tags = [...tags,
  { name: 'Authority', value: 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY' },
  { name: "Content-Type", value: "text/html" }
  ];

  const result = await ao.spawn({
    module: newProcessModule ? newProcessModule : AOModule,
    scheduler: AOScheduler,
    tags,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : createDataItemSignerManual(window.arweaveWallet),
    data: processHtml
  });

  return result;
}

export async function runLua(code: string, process: string, tags?: Tag[], transpile: boolean = true) {
  // console.log("transpiling", transpile)
  // if (transpile) {
  //   code = transpileLuaX(code)
  // }
  console.log(code)
  const { cu, mu, gateway } = getCustomUrls();
  const ao = connect({ MODE: "legacy", CU_URL: cu, MU_URL: mu, GATEWAY_URL: gateway });
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
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : createDataItemSignerManual(window.arweaveWallet),
    tags,
  });
  // delay 100ms before getting result
  await new Promise(resolve => setTimeout(resolve, 100));
  const result = await ao.result({ process, message });
  // console.log(result);
  (result as any).id = message;
  return result;
}

export async function getResults(process: string, cursor = "") {
  const { cu, mu, gateway } = getCustomUrls();
  const ao = connect({ MODE: "legacy", CU_URL: cu, MU_URL: mu, GATEWAY_URL: gateway }); // using default since custom cu url seems to fail with invalid request
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
  const { cu, mu, gateway } = getCustomUrls();
  const ao = connect({ MODE: "legacy", CU_URL: cu, MU_URL: mu, GATEWAY_URL: gateway });
  const r = await ao.monitor({
    process,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : createDataItemSignerManual(window.arweaveWallet),
  });

  return r;
}

export async function unmonitor(process: string) {
  const { cu, mu, gateway } = getCustomUrls();
  const ao = connect({ MODE: "legacy", CU_URL: cu, MU_URL: mu, GATEWAY_URL: gateway });
  const r = await ao.unmonitor({
    process,
    signer: (window.arweaveWallet as any)?.signDataItem ? createDataItemSigner(window.arweaveWallet) : createDataItemSignerManual(window.arweaveWallet),
  });

  return r;
}

export function parseOutupt(out: any) {
  if (!out.Output) return out;
  const data_ = out.Output.data;
  if (typeof data_ == "string") {
    try {
      return JSON.parse(data_);
    } catch (e) {
      return data_;
    }
  }
  // const { json, output, data } = data_;
  // if (data) return data;
  // if (json != "undefined") {
  //   return json;
  // }
  // try {
  //   return JSON.parse(output);
  // } catch (e) {
  //   return output;
  // }
}

export async function readHandler(args: {
  processId: string;
  action: string;
  tags?: Tag[];
  data?: any;
}): Promise<any> {
  const tags = [{ name: 'Action', value: args.action }];
  if (args.tags) tags.push(...args.tags);
  let data = JSON.stringify(args.data || {});

  const { cu, mu, gateway } = getCustomUrls();
  const ao = connect({ MODE: "legacy", CU_URL: cu, MU_URL: mu, GATEWAY_URL: gateway });
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

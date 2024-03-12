
import fs from 'fs'
import dotenv from 'dotenv'
import { execSync } from 'child_process';
import { WarpFactory, defaultCacheOptions } from "warp-contracts";
import Arweave from "arweave";

dotenv.config()

const ANT = "aXJmbLDKLMTnmjyhvEcpML0nI1GZaNQVIGahTWX5mLw"
// const SUBDOMAIN = "betteridea"

const jwk = JSON.parse(Buffer.from(process.env.WALLET64, "base64").toString("utf-8"));
// console.log(jwk)
const arweave = Arweave.init({ host: "arweave.net", port: 443, protocol: "https" });
const warp = WarpFactory.custom(arweave, defaultCacheOptions, "mainnet").useArweaveGateway().build();

const contract = warp.contract(ANT).connect(jwk);


const _ = (err, stdout, stderr) => {
    if (err) {
        console.log(err)
        return
    }
    console.log(stdout)
    console.log(stderr)
}

console.log("Uploading...")
execSync(`cd ./dist && ardrive upload-file -s '${process.env.SEED}' -l ./ -F ${process.env.APP_FOLDER_EID} ${process.env.TURBO == "YES" && "--turbo"}`, _)

console.log("Creating manifest...")
execSync(`ardrive create-manifest -s '${process.env.SEED}' -f ${process.env.APP_FOLDER_EID} ${process.env.TURBO == "YES" && "--turbo"} --dry-run > manifest.json`, _)

console.log("Modifying manifest...")
const output = JSON.parse(fs.readFileSync('./manifest.json'))

const manifest = output.manifest

manifest.index.path = "index.html"
const paths = manifest.paths

Object.keys(paths).forEach((key) => {
    paths[key.replace("./", "")] = paths[key]
    delete paths[key]
})

console.log(manifest)

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2))

console.log("Uploading files with manifest...")
execSync(`cd ./dist && ardrive upload-file -s "${process.env.SEED}" -l ./manifest.json --content-type application/x.arweave-manifest+json -F ${process.env.APP_FOLDER_EID} ${process.env.TURBO == "YES" && "--turbo"} > ../out.json`, _)

const out = JSON.parse(fs.readFileSync('./out.json'))
console.log(out)

const dataTxnId = out.created[0].dataTxId
console.log("deployed at https://arweave.net/" + dataTxnId)


console.log("Updating ANT token...")
contract.writeInteraction({
    function: "setRecord",
    subDomain: "@",
    transactionId: dataTxnId,
    ttlSeconds: 3600
}).then((tx) => {
    console.log(tx.originalTxId)
}).catch((err) => {
    console.log(err)
})

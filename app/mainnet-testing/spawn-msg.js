import { connect, createSigner } from "@permaweb/aoconnect"
// import AOCore from '@permaweb/ao-core-libs';
// import { createSigner } from '@permaweb/ao-core-libs'; // Or your own custom signer
import Arweave from "arweave"
import fs from "fs"

const ar = new Arweave({
    host: "arweave.net",
    port: 443,
    protocol: "https",
})

const jwk = JSON.parse(fs.readFileSync("./wallet.json", "utf8"))
const address = await ar.wallets.jwkToAddress(jwk)
console.log("ADDRESS: ", address, "\n\n\n\n")

// const jwk = await ar.wallets.generate()


const signer = createSigner(jwk)
const hb_operator = "CUO_Jtx-J9Ph4NVKY_Bgii4HSUwK3NbdaIlPDSiy8Cs"
const hb_authority = hb_operator + ',fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY'
const mainnet_module = "xVcnPK8MPmcocS6zwq1eLmM2KhfyarP8zzmz3UVi1g4"

// const ao = AOCore.init({ signer, url: "https://hb.arnode.asia" });
const ao = connect({
    MODE: "mainnet",
    URL: "https://hb.arnode.asia",
    signer: signer
})

const res = await ao.request({
    // path: "/push",
    // method: "POST",
    // type: "Process",
    // device: "process@1.0",
    // 'scheduler-device': 'scheduler@1.0',
    // 'push-device': 'push@1.0',
    // 'execution-device': 'lua@5.3a',
    // 'data-protocol': 'ao',
    // variant: 'ao.N.1',
    // 'signing-format': 'ANS-104',
    // authority: hb_authority,
    // scheduler: hb_operator,
    // module: mainnet_module


    path: '/push',
    method: 'POST',
    type: 'Process',
    device: 'process@1.0',
    'scheduler-device': 'scheduler@1.0',
    'push-device': 'push@1.0',
    'execution-device': 'lua@5.3a',
    'data-protocol': 'ao',
    variant: 'ao.N.1',
    'App-Name': 'hyper-aos-2',
    Name: 'test-process-2',
    Random: Math.random().toString(),
    Authority: 'CUO_Jtx-J9Ph4NVKY_Bgii4HSUwK3NbdaIlPDSiy8Cs,fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY',
    'aos-version': '2.0.8',
    'signing-format': 'ANS-104',
    Module: 'xVcnPK8MPmcocS6zwq1eLmM2KhfyarP8zzmz3UVi1g4',
    scheduler: 'CUO_Jtx-J9Ph4NVKY_Bgii4HSUwK3NbdaIlPDSiy8Cs',
})

// @ts-ignore
const processId = res.process
// const processId = "pE9Zuajrf5vYMXQAcHJK9Mc5usiapU9n7Z4axrhrw-k"
console.log("PROCESS: ", processId, "\n\n\n\n")

// wait 1s
await new Promise(resolve => setTimeout(resolve, 1000))

const res2 = await ao.request({
    // path: `/${processId}~process@1.0/push/~json@1.0/serialize`,
    // method: "POST",
    // type: "Message",
    // 'data-protocol': 'ao',
    // variant: 'ao.N.1',
    // target: processId,
    // "signing-format": "ANS-104"

    path: `/${processId}~process@1.0/push/serialize~json@1.0`,
    method: 'POST',
    type: 'Message',
    Action: 'Eval',
    'data-protocol': 'ao',
    variant: 'ao.N.1',
    target: processId,
    'signing-format': 'ANS-104',
    data: "require('.process')._version"
})

console.log("RES2: ", res2)
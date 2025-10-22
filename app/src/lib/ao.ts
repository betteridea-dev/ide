import { connect } from "@permaweb/aoconnect";
// import AOCore from "@permaweb/ao-core-libs";
import Constants from "./constants";
import { startLiveMonitoring } from "./live-mainnet";
import log from "./logger";
import { withDuration } from "./utils";

export type Tag = {
    name: string,
    value: string
}

const assoc = (k: string, v: any, o: any) => {
    o[k] = v
    return o
}

interface TestnetOptions {
    CU_URL: string;
    GATEWAY_URL: string;
    signer: any;
}

interface MainnetOptions {
    GATEWAY_URL: string;
    HB_URL: string;
    signer?: any;
}

export class MainnetAO {
    private hbUrl: string;
    private gatewayUrl: string;
    private signer?: any;

    constructor(params: MainnetOptions) {
        this.hbUrl = params.HB_URL || "https://hb.arweave.tech";
        this.gatewayUrl = params.GATEWAY_URL || "https://arweave.tech";
        this.signer = params.signer;
    }

    ao() {
        return connect({
            MODE: "mainnet",
            URL: this.hbUrl,
            GATEWAY_URL: this.gatewayUrl,
            signer: this.signer,
            device: "process@1.0",
        })
        // return AOCore.init({ signer: this.signer, url: this.hbUrl })
    }

    sanitizeResponse(input: Record<string, any>) {
        const blockedKeys = new Set<string>([
            'accept',
            'accept-bundle',
            'accept-encoding',
            'accept-language',
            'connection',
            'commitments',
            'device',
            'host',
            'method',
            'priority',
            'status',
            'sec-ch-ua',
            'sec-ch-ua-mobile',
            'sec-ch-ua-platform',
            'sec-fetch-dest',
            'sec-fetch-mode',
            'sec-fetch-site',
            'sec-fetch-user',
            'sec-gpc',
            'upgrade-insecure-requests',
            'user-agent',
            'x-forwarded-for',
            'x-forwarded-proto',
            'x-real-ip',
            'origin',
            'referer',
            'cdn-loop',
            'cf-connecting-ip',
            'cf-ipcountry',
            'cf-ray',
            'cf-visitor',
            'remote-host',
        ])
        return Object.fromEntries(
            Object.entries(input).filter(([key]) => !blockedKeys.has(key))
        );
    }

    async operator(): Promise<string> {
        const hashpath = this.hbUrl + '/~meta@1.0/info/address'
        log({ type: "input", label: "Fetching Operator Address", data: hashpath })
        const { result, duration } = await withDuration(() => fetch(hashpath))
        const scheduler = (await result.text()).trim()
        log({ type: "success", label: "Fetched Operator Address", data: scheduler, duration })
        return scheduler
    }

    async read<T>({ path }: { path: string }): Promise<T> {
        let hashpath = this.hbUrl + (path.startsWith("/") ? path : "/" + path)
        // hashpath = hashpath + "/~json@1.0/serialize"

        log({ type: "input", label: "Reading Process State", data: { path: hashpath } })
        const { result, duration } = await withDuration(() => fetch(hashpath, {
            headers: {
                'accept': "application/json",
                'accept-bundle': "true",
            }
        }))
        const resultJson = await result.json()
        log({ type: "output", label: "Process State Read", data: resultJson, duration })
        return this.sanitizeResponse(resultJson) as T
    }

    async spawn({ tags, data, module_ }: { tags?: { name: string; value: string }[], data?: any, module_?: string }): Promise<string> {
        const params: any = {
            path: '/push',
            method: 'POST',
            type: 'Process',
            device: 'process@1.0',
            'scheduler-device': 'scheduler@1.0',
            'push-device': 'push@1.0',
            'execution-device': 'lua@5.3a',
            'data-protocol': 'ao',
            variant: 'ao.N.1',
            random: Math.random().toString(),
            authority: await this.operator() + ',fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY',
            // 'signing-format': 'ans104',
            'signing-format': 'ANS-104',
            module: module_ || Constants.modules.mainnet.hyperAos,
            scheduler: await this.operator() + ",fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY",
            accept: 'application/json',
            // 'accept-bundle': "true",
            ...Constants.tags.common,
        }

        // Add custom tags as properties
        if (tags) {
            tags.forEach(tag => {
                params[tag.name] = tag.value
            })
        }

        // Add data if provided
        if (data) {
            params.data = data
        }

        log({ type: "input", label: "Spawning Process", data: params })
        const { result, duration } = await withDuration(() => this.ao().request(params))
        log({ type: "success", label: "Process Spawned", data: result, duration })
        // const body: ReadableStream = res.body
        // const reader = body.getReader()
        // const decoder = new TextDecoder()
        // let result = ''
        // while (true) {
        //     const { done, value } = await reader.read()
        //     if (done) break
        //     result += decoder.decode(value, { stream: true })
        // }

        const process = (result as any).process
        // const process = await res.headers.get("process")
        // @ts-ignore

        // delay 1s to ensure process is ready
        await new Promise(resolve => setTimeout(resolve, 100))

        // compute slot and wait for initialization
        return new Promise((resolve) => {
            // try {
            const slot = startLiveMonitoring(process, {
                hbUrl: this.hbUrl,
                gatewayUrl: this.gatewayUrl,
                intervalMs: 1000,
                onResult: async (result) => {
                    log({ type: "success", label: "Process Live Monitoring Complete", data: result })
                    slot() // Stop monitoring

                    // send an initial message to activate the process
                    try {
                        const res2 = await this.runLua({
                            processId: process,
                            code: "require('.process')._version"
                        })
                        log({ type: "success", label: "Process Initialized", data: { processId: process, version: res2 } })
                    } catch (error) {
                        log({ type: "warning", label: "Process Initialization Warning", data: error })
                    }

                    // Return the process ID
                    resolve(process)
                }
            })
            setTimeout(() => slot(), 5000)
            resolve(process)
            // }
            // catch (e) {
            //     // Spawned but failed to initialize process
            // } finally {
            //     resolve(process)
            // }
        })
    }

    async write({ processId, tags, data }: { processId: string, tags?: { name: string; value: string }[], data?: any }) {

        const params: any = {
            path: `/${processId}/push`,
            method: 'POST',
            type: 'Message',
            'data-protocol': 'ao',
            variant: 'ao.N.1',
            target: processId,
            // 'signing-format': 'ans104',
            'signing-format': 'ANS-104',
            accept: 'application/json',
            // 'accept-bundle': "true",
        }

        // Add tags as properties
        if (tags) {
            tags.forEach(tag => {
                params[tag.name] = tag.value
            })
        }

        // Add data if provided
        if (data) {
            params.data = data
        }

        log({ type: "input", label: "Write Input", data: params })
        const { result, duration } = await withDuration(() => this.ao().request(params))
        log({ type: "output", label: "Write Result", data: result, duration })
        const e = await JSON.parse((result as any).body)
        return e
    }

    async runLua({ processId, code }: { processId: string, code: string }) {
        log({ type: "debug", label: "Run Lua Input", data: { processId, code } })
        const { result, duration } = await withDuration(() => this.write({
            processId,
            tags: [
                { name: "Action", value: "Eval" }
            ],
            data: code
        }))
        log({ type: "success", label: "Run Lua Output", data: result, duration })
        return result
    }
}
import { connect, createSigner } from "@permaweb/aoconnect";
import AOCore from "@permaweb/ao-core-libs"
import Constants from "./constants";
import { startLiveMonitoring } from "./live-mainnet";

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

export class TestnetAO {
    private cuUrl: string;
    private gatewayUrl: string;
    private signer: any;

    constructor(params: TestnetOptions) {
        this.cuUrl = params.CU_URL;
        this.gatewayUrl = params.GATEWAY_URL;
        this.signer = params.signer;
    }

    ao() {
        return connect({
            MODE: "legacy",
            CU_URL: this.cuUrl,
            GATEWAY_URL: this.gatewayUrl,
        })
    }

    async read({ processId, tags, data, Owner }: { processId: string, tags: Tag[], data: any, Owner: string }) {
        const res = await this.ao().dryrun({
            process: processId,
            tags: tags,
            data: data,
            Owner: Owner
        })
        return res
    }

    async write({ processId, tags, data, noResult = false }: { processId: string, tags: Tag[], data: any, noResult?: boolean }) {
        const mid = await this.ao().message({
            process: processId,
            tags: tags,
            data: data,
            signer: this.signer
        })

        if (noResult) {
            return mid
        }

        const res1 = await this.ao().result({
            process: processId,
            message: mid,
        })

        return res1
    }
}

export class MainnetAO {
    private hbUrl: string;
    private gatewayUrl: string;
    private signer?: any;

    constructor(params: MainnetOptions) {
        this.hbUrl = params.HB_URL || "https://hb.arnode.asia";
        this.gatewayUrl = params.GATEWAY_URL || "https://arnode.asia";
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
        return AOCore.init({ signer: this.signer, url: this.hbUrl })
    }

    sanitizeResponse(input: Record<string, any>) {
        const blockedKeys = new Set<string>([
            'accept',
            'accept-bundle',
            'accept-encoding',
            'accept-language',
            'connection',
            'device',
            'host',
            'method',
            'priority',
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
        const scheduler = (await (await fetch(this.hbUrl + '/~meta@1.0/info/address')).text()).trim()
        return scheduler
    }

    async read<T>({ path }: { path: string }): Promise<T> {
        let hashpath = this.hbUrl + (path.startsWith("/") ? path : "/" + path)
        hashpath = hashpath + "/~json@1.0/serialize"

        const res = await fetch(hashpath)
        return (await res.json()) as T
    }

    async write({ processId, tags, data }: { processId: string, tags?: { name: string; value: string }[], data?: any }) {
        const params: any = {
            path: `/${processId}~process@1.0/push/serialize~json@1.0`,
            method: 'POST',
            type: 'Message',
            'data-protocol': 'ao',
            variant: 'ao.N.1',
            target: processId,
            'signing-format': 'ANS-104',
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

        const res = await this.ao().request(params)
        return await JSON.parse(res.body)
    }

    async spawn({ tags, data, module_ }: { tags?: { name: string; value: string }[], data?: any, module_?: string }) {
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
            Random: Math.random().toString(),
            Authority: await this.operator() + ',fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY',
            'signing-format': 'ANS-104',
            Module: module_ || Constants.modules.mainnet.hyperAos,
            scheduler: await this.operator(),
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

        console.log(params)
        const res = await this.ao().request(params)
        // const body: ReadableStream = res.body
        // const reader = body.getReader()
        // const decoder = new TextDecoder()
        // let result = ''
        // while (true) {
        //     const { done, value } = await reader.read()
        //     if (done) break
        //     result += decoder.decode(value, { stream: true })
        // }
        console.log(res)

        // const spawnResJson = await res.json()
        const spawnResJson = await res
        // @ts-ignore
        const process = (spawnResJson.process)
        console.log(process)

        // delay 1s to ensure process is ready
        await new Promise(resolve => setTimeout(resolve, 1000))

        // compute slot
        const slot = startLiveMonitoring(process, {
            hbUrl: this.hbUrl,
            gatewayUrl: this.gatewayUrl,
            intervalMs: 1000,
            onResult: async (result) => {
                console.log(result)
                slot()
                // send an initial message to activate the process
                const res2 = await this.write({
                    processId: process,
                    tags: [{ name: 'Action', value: 'Eval' }],
                    data: "require('.process')._version"
                })
                const res2Json = await res2.json()
                // spawn should return process
                Promise.resolve(process)
                return process
            }
        })

        return process
    }

    async runLua({ processId, code }: { processId: string, code: string }) {
        const res = await this.write({
            processId,
            tags: [
                { name: "Action", value: "Eval" }
            ],
            data: code
        })
        return res
    }
}
import express from 'express';
import cors from 'cors'
import sqlite3 from 'sqlite3';

import "dotenv/config";
import { Copilot } from "monacopilot";
import { SYSTEM_PROMPT } from "./systemPrompt";
import { INLINE_SYSTEM_PROMPT } from "./inlineSystemPrompt";
import { INLINE_SYSTEM_CONTEXT } from "./inlineSystemContext";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// import fs from "fs";
// const SYSTEM_INSTRUCTION = fs.readFileSync("./backend/cookbook.md", "utf8");

sqlite3.verbose();
const db = new sqlite3.Database('./analytics.db');

// Initialize the Google AI client
// const apiKey = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash-8b",
//     systemInstruction: SYSTEM_INSTRUCTION,
//     generationConfig: {
//         temperature: 1,
//         topP: 0.95,
//         topK: 40,
//         maxOutputTokens: 8192,
//         responseMimeType: "text/plain"
//     }
// });

const copilot = new Copilot(process.env.GROQ_API_KEY, {
    provider: "groq",
    model: "llama-3-70b",
});

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3001;

type TBody = {
    action: "codecell_load" | "codecell_run"
    cellId: string
    userId: string
    appName: string
    messageId?: string
    referrer: string
    geo?: {
        country?: string
        countryCode?: string
        region?: string
        regionName?: string
        city?: string
        zip?: string
        lat?: number
        lon?: number
        timezone?: string
        isp?: string
        org?: string
        as?: string
        query?: string
    }
}

const codecell_load_table = `CREATE TABLE IF NOT EXISTS codecell_loads (
    timestamp NUMBER,
    userId TEXT,
    appName TEXT,
    referrer TEXT,
    country TEXT,
    countryCode TEXT,
    region TEXT,
    regionName TEXT,
    city TEXT,
    isp TEXT,
    org TEXT,
    as_ TEXT
)`;
db.run(codecell_load_table)

const codecell_run_table = `CREATE TABLE IF NOT EXISTS codecell_runs (
    timestamp NUMBER,
    userId TEXT,
    appName TEXT,
    messageId TEXT,
    referrer TEXT,
    country TEXT,
    countryCode TEXT,
    region TEXT,
    regionName TEXT,
    city TEXT,
    isp TEXT,
    org TEXT,
    as_ TEXT
)`;
db.run(codecell_run_table);

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});


app.get('/analytics', (req, res) => {
    const queries = [
        //total
        `SELECT COUNT(*) as total_loads FROM codecell_loads`,
        `SELECT COUNT(*) as total_runs FROM codecell_runs`,
        `SELECT COUNT(DISTINCT userId) as total_users FROM codecell_loads`,
        `SELECT COUNT(DISTINCT appName) as total_apps FROM codecell_loads`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers FROM codecell_loads`,
        //today
        `SELECT COUNT(*) as total_loads_today FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(*) as total_runs_today FROM codecell_runs WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT userId) as total_users_today FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT appName) as total_apps_today FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers_today FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        //yesterday
        `SELECT COUNT(*) as total_loads_yesterday FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000} AND timestamp < ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(*) as total_runs_yesterday FROM codecell_runs WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000} AND timestamp < ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT userId) as total_users_yesterday FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000} AND timestamp < ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT appName) as total_apps_yesterday FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000} AND timestamp < ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers_yesterday FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000} AND timestamp < ${new Date().setHours(0, 0, 0, 0)}`,
        // this week
        `SELECT COUNT(*) as total_loads_thisweek FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay()}`,
        `SELECT COUNT(*) as total_runs_thisweek FROM codecell_runs WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay()}`,
        `SELECT COUNT(DISTINCT userId) as total_users_thisweek FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay()}`,
        `SELECT COUNT(DISTINCT appName) as total_apps_thisweek FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay()}`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers_thisweek FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay()}`,
        //previous week
        `SELECT COUNT(*) as total_loads_lastweek FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay() - 604800000}`,
        `SELECT COUNT(*) as total_runs_lastweek FROM codecell_runs WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay() - 604800000}`,
        `SELECT COUNT(DISTINCT userId) as total_users_lastweek FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay() - 604800000}`,
        `SELECT COUNT(DISTINCT appName) as total_apps_lastweek FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay() - 604800000}`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers_lastweek FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDay() - 604800000}`,
        // this month
        `SELECT COUNT(*) as total_loads_thismonth FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate()}`,
        `SELECT COUNT(*) as total_runs_thismonth FROM codecell_runs WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate()}`,
        `SELECT COUNT(DISTINCT userId) as total_users_thismonth FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate()}`,
        `SELECT COUNT(DISTINCT appName) as total_apps_thismonth FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate()}`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers_thismonth FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate()}`,
        // previous month
        `SELECT COUNT(*) as total_loads_lastmonth FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate() - 2592000000}`,
        `SELECT COUNT(*) as total_runs_lastmonth FROM codecell_runs WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate() - 2592000000}`,
        `SELECT COUNT(DISTINCT userId) as total_users_lastmonth FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate() - 2592000000}`,
        `SELECT COUNT(DISTINCT appName) as total_apps_lastmonth FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate() - 2592000000}`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers_lastmonth FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0) - 86400000 * (new Date()).getDate() - 2592000000}`,

    ]

    // run all queries 1 by one and collect results
    const results = []
    queries.forEach((query) => {
        db.all(query, (err, rows) => {
            if (err) {
                console.log(err)
                res.status(500).send(err);
                return;
            }
            results.push(rows);
            if (results.length === queries.length) {
                let data = results.map((r) => r[0]).reduce((acc, cur) => ({ ...acc, ...cur }), {})
                // nest the data according to time groups- today, yesterday, lastweek, lastmonth
                data = {
                    total: {
                        loads: data.total_loads,
                        runs: data.total_runs,
                        users: data.total_users,
                        apps: data.total_apps,
                        referrers: data.total_referrers
                    },
                    today: {
                        loads: data.total_loads_today,
                        runs: data.total_runs_today,
                        users: data.total_users_today,
                        apps: data.total_apps_today,
                        referrers: data.total_referrers_today
                    },
                    yesterday: {
                        loads: data.total_loads_yesterday,
                        runs: data.total_runs_yesterday,
                        users: data.total_users_yesterday,
                        apps: data.total_apps_yesterday,
                        referrers: data.total_referrers_yesterday
                    },
                    thisweek: {
                        loads: data.total_loads_thisweek,
                        runs: data.total_runs_thisweek,
                        users: data.total_users_thisweek,
                        apps: data.total_apps_thisweek,
                        referrers: data.total_referrers_thisweek
                    },
                    lastweek: {
                        loads: data.total_loads_lastweek,
                        runs: data.total_runs_lastweek,
                        users: data.total_users_lastweek,
                        apps: data.total_apps_lastweek,
                        referrers: data.total_referrers_lastweek
                    },
                    thismonth: {
                        loads: data.total_loads_thismonth,
                        runs: data.total_runs_thismonth,
                        users: data.total_users_thismonth,
                        apps: data.total_apps_thismonth,
                        referrers: data.total_referrers_thismonth
                    },
                    lastmonth: {
                        loads: data.total_loads_lastmonth,
                        runs: data.total_runs_lastmonth,
                        users: data.total_users_lastmonth,
                        apps: data.total_apps_lastmonth,
                        referrers: data.total_referrers_lastmonth
                    }
                }
                res.status(200).send(data);
            }
        })
    })
})

app.get('/analytics/referrers', (req, res) => {
    db.all(`SELECT referrer, COUNT(*) as count FROM codecell_loads GROUP BY referrer ORDER BY count DESC`, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(500).send(err);
        } else {
            res.status(200).send(rows);
        }
    })
})

app.post('/analytics', async (req, res) => {
    const date = (new Date());
    const body = req.body as TBody;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const ipApi = `http://ip-api.com/json/${ip}`;
    const statusHook = "https://discord.com/api/webhooks/1275688569289310219/AqcOInJdVL3Vy8is9Y6fxEKv7zPaxKhrjNc6ATiGNdWWltlI4HpNZVXbFCh646SMO2h7";

    const ipdata = await fetch(ipApi);
    if (ipdata.ok) {
        const ipjson = await ipdata.json();
        if (ipjson.status === "success") {
            body.geo = ipjson;
        } else {
            body.geo = {
                country: "",
                countryCode: "",
                region: "",
                regionName: "",
                city: "",
                isp: "",
                org: "",
                as: ""
            }
        }
    }
    console.log(`[${date.toUTCString()}] - ${ip} - ${body.geo.city || "NA"} - ${body.referrer}`)
    await fetch(statusHook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: `\`\`\`${date.toUTCString()}\n${ip} - ${body.geo.city || "NA"} - ${body.referrer}\`\`\``
        })
    })

    switch (body.action) {
        case "codecell_load":
            await (new Promise((resolve, reject) => { setTimeout(resolve, 100) }))
            db.prepare(`
                INSERT INTO codecell_loads (timestamp, userId, appName, referrer, country, countryCode, region, regionName, city, isp, org, as_)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(date.getTime(), body.userId, body.appName, body.referrer, body.geo.country, body.geo.countryCode, body.geo.region, body.geo.regionName, body.geo.city, body.geo.isp, body.geo.org, body.geo.as)
            break;
        case "codecell_run":
            await (new Promise((resolve, reject) => { setTimeout(resolve, 100) }))
            db.prepare(`
                INSERT INTO codecell_runs (timestamp, userId, appName, messageId, referrer, country, countryCode, region, regionName, city, isp, org, as_)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(date.getTime(), body.userId, body.appName, body.messageId, body.referrer, body.geo.country, body.geo.countryCode, body.geo.region, body.geo.regionName, body.geo.city, body.geo.isp, body.geo.org, body.geo.as)
            break;
        default:
            break;
    }
    res.status(200).send('Analytics data received!');
})

///////////////////////////////////////////////

app.post("/complete", async (req, res) => {
    try {
        const { completion, error, raw } = await copilot.complete({
            body: req.body,
            options: {
                customPrompt: metadata => ({
                    system: INLINE_SYSTEM_CONTEXT + "\n" + INLINE_SYSTEM_PROMPT,
                }),
            },
        });

        if (raw) {
            console.log(raw)
            calculateCost((raw as any).usage.total_tokens);
        }

        if (error) {
            console.error("Completion error:", error);
            return res.status(500).json({ completion: null, error });
        }

        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Access-Control-Allow-Credentials", "true");

        return res.status(200).json({ completion });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({
            completion: null,
            error: "Internal server error",
        });
    }
});

// app.post("/chat", async (req, res) => {
//     const { message, chat } = req.body;

//     try {

//         const chatSession = model.startChat({
//             history: chat,
//         });

//         const result = await chatSession.sendMessage(message);

//         res.status(200).send(result.response.text());
//     } catch (err) {
//         console.error("Chat error:", err);
//         return res.status(500).json({
//             response: null,
//             error: err.message,
//         });
//     }
// })


app.post("/chat", async (req, res) => {
    try {
        const { message, fileContext, visibleRange, chat } = req.body;

        //const prompt = constructPrompt(
        //  message,
        //  fileContext,
        //  //currentFile,
        //  visibleRange,
        //);

        // const system = { role: "system", content: SYSTEM_PROMPT };

        // chat is a json array, append system prompt to the beginning of the array
        // const messages = chat ? [system, ...chat] : [system];

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: chat,
                    model: "llama3-8b-8192",
                    temperature: 1,
                    max_tokens: 1024,
                    top_p: 1,
                    stream: false,
                    stop: null,
                }),
            },
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Groq API response:", errorData);
            throw new Error(`Groq API error: ${response.statusText} - ${errorData}`);
        }

        const completion = await response.json();

        if (completion.choices?.[0]?.message?.content) {
            if (completion.usage) {
                calculateCost(completion.usage.total_tokens);
            }

            res.header("Access-Control-Allow-Origin", req.headers.origin);
            res.header("Access-Control-Allow-Credentials", "true");

            return res.status(200).json({
                response: completion.choices[0].message.content,
                fileContext: fileContext,
            });
        }

        throw new Error("No completion generated");
    } catch (err) {
        console.error("Chat error:", err);
        return res.status(500).json({
            response: null,
            error: err.message,
        });
    }
});

// Helper Functions
function constructPrompt(message: string, fileContext: any, currentFile: string = "", visibleRange: any) {
    let contextualPrompt = "";

    if (currentFile) {
        contextualPrompt += `Current file: ${currentFile}\n`;
    }
    if (fileContext) {
        contextualPrompt += `File context: ${JSON.stringify(fileContext)}\n`;
    }
    if (visibleRange) {
        contextualPrompt += `Visible range: ${JSON.stringify(visibleRange)}\n`;
    }

    contextualPrompt += `\nUser message: ${message}`;
    return contextualPrompt;
}

function calculateCost(tokens: number) {
    console.log(`Token usage: ${tokens}`);
}


///////////////////////////////////////////////

app.options("/complete", cors());
app.options("/chat", cors());

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
import express from 'express';
import cors from 'cors'
import sqlite3 from 'sqlite3';

sqlite3.verbose();
const db = new sqlite3.Database('./analytics.db');

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

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});


app.get('/analytics', (req, res) => {
    res.status(200).send('Analytics data');
})

app.post('/analytics', async (req, res) => {
    const date = (new Date());
    const body = req.body as TBody;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const ipApi = `http://ip-api.com/json/${ipAddress}`;

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
    console.log(`[${date.toLocaleString()}] - ${ipAddress} - ${body.geo.city || "NA"} - ${body.referrer}`)

    switch (body.action) {
        case "codecell_load":
            db.run(codecell_load_table)
            await (new Promise((resolve, reject) => { setTimeout(resolve, 100) }))
            db.prepare(`
                INSERT INTO codecell_loads (timestamp, userId, appName, referrer, country, countryCode, region, regionName, city, isp, org, as_)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(date.getTime(), body.userId, body.appName, body.referrer, body.geo.country, body.geo.countryCode, body.geo.region, body.geo.regionName, body.geo.city, body.geo.isp, body.geo.org, body.geo.as)
            break;
        case "codecell_run":
            db.run(codecell_run_table);
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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
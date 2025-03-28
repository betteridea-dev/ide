import { Router } from 'express';
import db from '../../db/database';
import { TBody } from '../../types';

const router = Router();

// Analytics POST route
router.post('/', async (req, res) => {
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
            };
        }
    }
    console.log(`[${date.toUTCString()}] - ${ip} - ${body.geo.city || "NA"} - ${body.referrer}`);
    await fetch(statusHook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: `\`\`\`${date.toUTCString()}\n${ip} - ${body.geo.city || "NA"} - ${body.referrer}\`\`\``
        })
    });

    switch (body.action) {
        case "codecell_load":
            await (new Promise((resolve, reject) => { setTimeout(resolve, 100); }));
            db.prepare(`
                INSERT INTO codecell_loads (timestamp, userId, appName, referrer, country, countryCode, region, regionName, city, isp, org, as_)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(date.getTime(), body.userId, body.appName, body.referrer, body.geo.country, body.geo.countryCode, body.geo.region, body.geo.regionName, body.geo.city, body.geo.isp, body.geo.org, body.geo.as);
            break;
        case "codecell_run":
            await (new Promise((resolve, reject) => { setTimeout(resolve, 100); }));
            db.prepare(`
                INSERT INTO codecell_runs (timestamp, userId, appName, messageId, referrer, country, countryCode, region, regionName, city, isp, org, as_)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(date.getTime(), body.userId, body.appName, body.messageId, body.referrer, body.geo.country, body.geo.countryCode, body.geo.region, body.geo.regionName, body.geo.city, body.geo.isp, body.geo.org, body.geo.as);
            break;
        default:
            break;
    }
    res.status(200).send('Analytics data received!');
});

export default router; 
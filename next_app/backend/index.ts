import express from 'express';
import cors from 'cors'
import sqlite3 from 'sqlite3';

sqlite3.verbose();
const db = new sqlite3.Database(':memory:');

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3001;

type TBody = {
    action: "codecell_load" | "codecell_run"
    cellId: string
    appName: string
    messageId?: string
    domain: string
    path: string
}

const codecell_load_table = `CREATE TABLE IF NOT EXISTS codecell_loads (
    timestamp TEXT,
    cellId TEXT,
    appName TEXT,
    messageId TEXT,
    domain TEXT,
    path TEXT
)`;

const codecell_run_table = `CREATE TABLE IF NOT EXISTS codecell_runs (
    timestamp TEXT,
    cellId TEXT,
    appName TEXT,
    messageId TEXT,
    domain TEXT,
    path TEXT
)`;

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});


app.get('/analytics', (req, res) => {
    res.status(200).send('Analytics data');
})

app.post('/analytics', (req, res) => {
    const timestamp = new Date().toISOString();
    const body = req.body as TBody;
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log(timestamp, ipAddress, body)

    switch (body.action) {
        case "codecell_load":
            break;
        case "codecell_run":
            break;
        default:
            break;
    }
    res.status(200).send('Analytics data received!');
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
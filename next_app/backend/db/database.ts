import sqlite3 from 'sqlite3';

// Initialize database
sqlite3.verbose();
const db = new sqlite3.Database('./analytics.db');

// Create tables if they don't exist
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
db.run(codecell_load_table);

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

export default db; 
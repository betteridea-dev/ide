import { Router } from 'express';
import db from '../../db/database';
import referrersRoute from './referrers';
import analyticsPostRoute from './post';

const router = Router();

// Register child routes
router.use('/referrers', referrersRoute);
router.use('/', analyticsPostRoute);

// Analytics GET route
router.get('/', (req, res) => {
    const queries = [
        // total
        `SELECT COUNT(*) as total_loads FROM codecell_loads`,
        `SELECT COUNT(*) as total_runs FROM codecell_runs`,
        `SELECT COUNT(DISTINCT userId) as total_users FROM codecell_loads`,
        `SELECT COUNT(DISTINCT appName) as total_apps FROM codecell_loads`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers FROM codecell_loads`,
        // today
        `SELECT COUNT(*) as total_loads_today FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(*) as total_runs_today FROM codecell_runs WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT userId) as total_users_today FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT appName) as total_apps_today FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        `SELECT COUNT(DISTINCT referrer) as total_referrers_today FROM codecell_loads WHERE timestamp > ${new Date().setHours(0, 0, 0, 0)}`,
        // yesterday
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
        // previous week
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
    ];

    // run all queries 1 by one and collect results
    const results = [];
    queries.forEach((query) => {
        db.all(query, (err, rows) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
                return;
            }
            results.push(rows);
            if (results.length === queries.length) {
                let data = results.map((r) => r[0]).reduce((acc, cur) => ({ ...acc, ...cur }), {});
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
                };
                res.status(200).send(data);
            }
        });
    });
});

export default router; 
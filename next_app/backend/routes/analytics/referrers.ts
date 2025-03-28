import { Router } from 'express';
import db from '../../db/database';

const router = Router();

// Get referrers analytics
router.get('/', (req, res) => {
    db.all(`SELECT referrer, COUNT(*) as count FROM codecell_loads GROUP BY referrer ORDER BY count DESC`, (err, rows) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            res.status(200).send(rows);
        }
    });
});

export default router; 
import { Router } from 'express';

const router = Router();

// Health check route
router.get('/', (req, res) => {
    res.status(304).redirect("https://ide.betteridea.dev");
});

export default router; 
import express from 'express';
import { getHealth, getMetrics } from '../controllers/healthController.js';

const router = express.Router();

router.get('/health', getHealth);
router.get('/metrics', getMetrics);

export default router;

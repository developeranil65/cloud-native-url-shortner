import express from 'express';
import { shortenUrl, getUrls } from '../controllers/urlController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Route: /api/shorten
router.post('/shorten', apiLimiter, shortenUrl);

// Route: /api/urls
router.get('/urls', getUrls);

export default router;

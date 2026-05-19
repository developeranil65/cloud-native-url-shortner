import express from 'express';
import { redirectUrl } from '../controllers/redirectController.js';

const router = express.Router();

// Route: /:shortCode
// Note: This needs to be registered at the root level in app.js
router.get('/:shortCode', redirectUrl);

export default router;

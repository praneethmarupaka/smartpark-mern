import { Router } from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favorite.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/toggle', toggleFavorite);
router.get('/', getMyFavorites);

export default router;

import { Router } from 'express';

import {
    getSessionStatus,
    register,
    login,
    current,
    logout
} from '../controllers/sessions.controller.js';

import { auth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getSessionStatus);

router.post('/register', register);

router.post('/login', login);

router.get('/current', auth, current);

router.post('/logout', logout);

export default router;
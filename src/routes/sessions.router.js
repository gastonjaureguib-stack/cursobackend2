import { Router } from 'express';
import passport from 'passport';

import {
    getSessionStatus,
    register,
    login,
    current,
    logout
} from '../controllers/sessions.controller.js';

const router = Router();

router.get('/', getSessionStatus);


// ========================================
// REGISTER
// ========================================

router.post(
    '/register',
    (req, res, next) => {
        passport.authenticate(
            'register',
            { session: false },
            (error, user, info) => {
                if (error) {
                    return next(error);
                }

                if (!user) {
                    const message =
                        info?.message ||
                        'No se pudo registrar el usuario';

                    const statusCode =
                        message ===
                        'El email ya está registrado'
                            ? 409
                            : 400;

                    return res
                        .status(statusCode)
                        .json({
                            status: 'error',
                            message
                        });
                }

                req.user = user;

                return register(req, res);
            }
        )(req, res, next);
    }
);


// ========================================
// LOGIN
// ========================================

router.post(
    '/login',
    (req, res, next) => {
        passport.authenticate(
            'login',
            { session: false },
            (error, user) => {
                if (error) {
                    return next(error);
                }

                if (!user) {
                    return res
                        .status(401)
                        .json({
                            status: 'error',
                            message:
                                'Credenciales inválidas'
                        });
                }

                req.user = user;

                return login(req, res);
            }
        )(req, res, next);
    }
);


// ========================================
// CURRENT
// ========================================

router.get(
    '/current',
    (req, res, next) => {
        passport.authenticate(
            'current',
            { session: false },
            (error, user) => {
                if (error) {
                    return next(error);
                }

                if (!user) {
                    return res
                        .status(401)
                        .json({
                            status: 'error',
                            message: 'No autenticado'
                        });
                }

                req.user = user;

                return current(req, res);
            }
        )(req, res, next);
    }
);


// ========================================
// LOGOUT
// ========================================

router.post('/logout', logout);

export default router;
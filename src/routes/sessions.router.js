import { Router } from 'express';
import passport from 'passport';

import {
    getSessionStatus,
    register,
    login,
    current,
    logout
} from '../controllers/sessions.controller.js';

import {
    authenticate
} from '../middlewares/auth.middleware.js';


const router = Router();


router.get(
    '/',
    getSessionStatus
);


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
                    return res
                        .status(
                            info?.statusCode || 400
                        )
                        .json({
                            status: 'error',
                            message:
                                info?.message ||
                                'No se pudo registrar el usuario'
                        });
                }


                req.user = user;

                return register(
                    req,
                    res,
                    next
                );
            }
        )(req, res, next);
    }
);


router.post(
    '/login',
    (req, res, next) => {
        passport.authenticate(
            'login',
            { session: false },
            (error, user, info) => {

                if (error) {
                    return next(error);
                }


                if (!user) {
                    return res
                        .status(
                            info?.statusCode || 401
                        )
                        .json({
                            status: 'error',
                            message:
                                info?.message ||
                                'Credenciales inválidas'
                        });
                }


                req.user = user;

                return login(
                    req,
                    res,
                    next
                );
            }
        )(req, res, next);
    }
);


router.get(
    '/current',
    authenticate,
    current
);


router.post(
    '/logout',
    logout
);


export default router;
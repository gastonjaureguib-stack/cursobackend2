import {
    Router
} from 'express';

import {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    updateEventStatus
} from '../controllers/events.controller.js';

import {
    authenticate
} from '../middlewares/auth.middleware.js';

import {
    authorize
} from '../middlewares/authorize.middleware.js';

import {
    checkEventOwnership
} from '../middlewares/ownership.middleware.js';

import {
    ROLES
} from '../constants/roles.js';

const router = Router();

router.get(
    '/',
    getEvents
);

router.get(
    '/:id',
    getEventById
);

router.post(
    '/',
    authenticate,
    authorize(
        ROLES.ORGANIZER,
        ROLES.ADMIN
    ),
    createEvent
);

router.put(
    '/:id',
    authenticate,
    authorize(
        ROLES.ORGANIZER,
        ROLES.ADMIN
    ),
    checkEventOwnership,
    updateEvent
);

router.patch(
    '/:id/status',
    authenticate,
    authorize(
        ROLES.ORGANIZER,
        ROLES.ADMIN
    ),
    checkEventOwnership,
    updateEventStatus
);

export default router;
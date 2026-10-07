import {
    eventsService
} from '../services/events.service.js';

import {
    ROLES
} from '../constants/roles.js';


export const checkEventOwnership = async (
    req,
    res,
    next
) => {
    try {
        const eventId =
            req.params.id ||
            req.params.eid;


        const event =
            await eventsService.getEventById(
                eventId
            );


        // El administrador puede acceder
        // a cualquier evento
        if (
            req.user.role ===
            ROLES.ADMIN
        ) {
            req.event = event;
            return next();
        }


        // El organizer solamente puede
        // acceder a sus propios eventos
        if (
            req.user.role ===
                ROLES.ORGANIZER &&
            event.organizer.toString() ===
                req.user._id.toString()
        ) {
            req.event = event;
            return next();
        }


        const error = new Error(
            'No tenés permisos para acceder a este evento'
        );

        error.statusCode = 403;

        return next(error);

    } catch (error) {
        next(error);
    }
};
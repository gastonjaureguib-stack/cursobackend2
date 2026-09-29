import mongoose from 'mongoose';

import {
    eventsRepository
} from '../repositories/events.repository.js';

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

        if (
            !mongoose.Types.ObjectId.isValid(
                eventId
            )
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de evento inválido'
            });
        }

        const event =
            await eventsRepository.findById(
                eventId
            );

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Evento no encontrado'
            });
        }

        if (
            req.user.role === ROLES.ADMIN
        ) {
            req.event = event;
            return next();
        }

        if (
            req.user.role ===
                ROLES.ORGANIZER &&
            event.organizer.toString() ===
                req.user._id.toString()
        ) {
            req.event = event;
            return next();
        }

        return res.status(403).json({
            status: 'error',
            message:
                'No tenés permisos para acceder a este evento'
        });
    } catch (error) {
        next(error);
    }
};
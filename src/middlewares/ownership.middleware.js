import { eventsRepository } from '../repositories/events.repository.js';
import { ROLES } from '../constants/roles.js';

export const checkEventOwnership = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        const event =
            await eventsRepository.findById(id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Evento no encontrado'
            });
        }

        if (req.user.role === ROLES.ADMIN) {
            req.event = event;
            return next();
        }

        if (
            req.user.role === ROLES.ORGANIZER &&
            event.organizer.toString() ===
                req.user._id.toString()
        ) {
            req.event = event;
            return next();
        }

        return res.status(403).json({
            status: 'error',
            message:
                'No tenés permisos para modificar este evento'
        });
    } catch (error) {
        next(error);
    }
};
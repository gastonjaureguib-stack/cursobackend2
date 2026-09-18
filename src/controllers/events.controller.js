import { eventsRepository } from '../repositories/events.repository.js';




export const getEvents = async (req, res, next) => {
    try {
        const events = await eventsRepository.findAll();

        return res.status(200).json({
            status: 'success',
            payload: events
        });
    } catch (error) {
        next(error);
    }
};




export const createEvent = async (req, res, next) => {
    try {
        const {
            title,
            description,
            date,
            location,
            capacity
        } = req.body;

        if (
            !title ||
            !description ||
            !date ||
            !location ||
            !capacity
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'Faltan campos obligatorios'
            });
        }

        const newEvent = await eventsRepository.createEvent({
            title,
            description,
            date,
            location,
            capacity,
            organizer: req.user._id
        });

        return res.status(201).json({
            status: 'success',
            payload: newEvent
        });
    } catch (error) {
        next(error);
    }
};




export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const event = await eventsRepository.findById(id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Evento no encontrado'
            });
        }

        if (
            req.user.role === 'organizer' &&
            event.organizer.toString() !==
                req.user._id.toString()
        ) {
            return res.status(403).json({
                status: 'error',
                message:
                    'No tenés permisos para modificar este evento'
            });
        }

      
        const allowedFields = [
            'title',
            'description',
            'date',
            'location',
            'capacity'
        ];

        const updateData = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const updatedEvent =
            await eventsRepository.updateEvent(
                id,
                updateData
            );

        return res.status(200).json({
            status: 'success',
            payload: updatedEvent
        });
    } catch (error) {
        next(error);
    }
};
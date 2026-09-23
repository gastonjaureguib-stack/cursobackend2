import {
    eventsService
} from '../services/events.service.js';

export const getEvents = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await eventsService.getEvents(
                req.query
            );

        return res.status(200).json({
            status: 'success',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        const event =
            await eventsService.getEventById(
                id
            );

        return res.status(200).json({
            status: 'success',
            payload: event
        });
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (
    req,
    res,
    next
) => {
    try {
        const {
            title,
            description,
            category,
            date,
            location,
            capacity,
            price
        } = req.body;

        const eventData = {
            title,
            description,
            category,
            date,
            location,
            capacity,
            price,
            organizer: req.user._id
        };

        const newEvent =
            await eventsService.createEvent(
                eventData
            );

        return res.status(201).json({
            status: 'success',
            payload: newEvent
        });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;

        const allowedFields = [
            'title',
            'description',
            'category',
            'date',
            'location',
            'capacity',
            'price'
        ];

        const updateData = {};

        allowedFields.forEach(
            (field) => {
                if (
                    req.body[field] !==
                    undefined
                ) {
                    updateData[field] =
                        req.body[field];
                }
            }
        );

        const updatedEvent =
            await eventsService.updateEvent(
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

export const updateEventStatus = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedEvent =
            await eventsService.updateEventStatus(
                id,
                status
            );

        return res.status(200).json({
            status: 'success',
            payload: updatedEvent
        });
    } catch (error) {
        next(error);
    }
};
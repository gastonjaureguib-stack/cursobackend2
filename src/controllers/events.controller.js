import {
    eventsService
} from '../services/events.service.js';

import {
    EventDTO
} from '../dto/event.dto.js';


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

        const eventsDTO =
            result.data.map(
                (event) =>
                    new EventDTO(event)
            );

        return res.status(200).json({
            status: 'success',
            ...result,
            data: eventsDTO
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
        const event =
            await eventsService.getEventById(
                req.params.id
            );

        return res.status(200).json({
            status: 'success',
            payload: new EventDTO(event)
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
        const newEvent =
            await eventsService.createEvent({
                ...req.body,
                organizer: req.user._id
            });

        return res.status(201).json({
            status: 'success',
            payload: new EventDTO(
                newEvent
            )
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
        const updatedEvent =
            await eventsService.updateEvent(
                req.params.id,
                req.body
            );

        return res.status(200).json({
            status: 'success',
            payload: new EventDTO(
                updatedEvent
            )
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
        const updatedEvent =
            await eventsService.updateEventStatus(
                req.params.id,
                req.body.status
            );

        return res.status(200).json({
            status: 'success',
            payload: new EventDTO(
                updatedEvent
            )
        });

    } catch (error) {
        next(error);
    }
};
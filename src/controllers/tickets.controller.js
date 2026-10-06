import {
    ticketsService
} from '../services/tickets.service.js';

import {
    TicketDTO
} from '../dto/ticket.dto.js';

import {
    EventDTO
} from '../dto/event.dto.js';


export const createTicket = async (
    req,
    res,
    next
) => {
    try {
        const { eid } = req.params;
        const { quantity } = req.body;

        const ticket =
            await ticketsService
                .createTicket(
                    req.user,
                    eid,
                    quantity
                );

        return res.status(201).json({
            status: 'success',
            message:
                'Inscripción realizada correctamente',
            payload:
                new TicketDTO(ticket)
        });
    } catch (error) {
        next(error);
    }
};


export const getMyTickets = async (
    req,
    res,
    next
) => {
    try {
        const tickets =
            await ticketsService
                .getMyTickets(
                    req.user._id
                );

        const ticketsDTO =
            tickets.map(
                (ticket) =>
                    new TicketDTO(
                        ticket
                    )
            );

        return res.status(200).json({
            status: 'success',
            payload: ticketsDTO
        });
    } catch (error) {
        next(error);
    }
};


export const getTicketsByEvent = async (
    req,
    res,
    next
) => {
    try {
        const { eid } = req.params;

        const result =
            await ticketsService
                .getTicketsByEvent(
                    eid
                );

        return res.status(200).json({
            status: 'success',
            payload: {
                event:
                    new EventDTO(
                        result.event
                    ),

                tickets:
                    result.tickets.map(
                        (ticket) =>
                            new TicketDTO(
                                ticket
                            )
                    )
            }
        });
    } catch (error) {
        next(error);
    }
};


export const cancelTicket = async (
    req,
    res,
    next
) => {
    try {
        const { tid } = req.params;

        const ticket =
            await ticketsService
                .cancelTicket(
                    tid,
                    req.user
                );

        return res.status(200).json({
            status: 'success',
            message:
                'Inscripción cancelada correctamente',
            payload:
                new TicketDTO(ticket)
        });
    } catch (error) {
        next(error);
    }
};
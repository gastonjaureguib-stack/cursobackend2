import crypto from 'crypto';
import mongoose from 'mongoose';

import {
    ticketsRepository
} from '../repositories/tickets.repository.js';

import {
    eventsService
} from './events.service.js';

import {
    usersService
} from './users.service.js';

import {
    mailService
} from './mail.service.js';

import {
    EVENT_STATUS
} from '../constants/eventStatus.js';

import {
    TICKET_STATUS
} from '../constants/ticketStatus.js';

import {
    ROLES
} from '../constants/roles.js';


export class TicketsService {

    async createTicket(
        user,
        eventId,
        quantity
    ) {
        const userId = user._id;


        // Validar cantidad
        if (
            typeof quantity !== 'number' ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            const error = new Error(
                'La cantidad debe ser un número entero mayor a 0'
            );

            error.statusCode = 400;
            throw error;
        }


        // Buscar y validar evento
        const event =
            await eventsService.getEventById(
                eventId
            );


        // El evento debe estar publicado
        if (
            event.status !==
            EVENT_STATUS.PUBLISHED
        ) {
            const error = new Error(
                'El evento no está disponible para inscripciones'
            );

            error.statusCode = 400;
            throw error;
        }


        // El evento debe ser futuro
        if (
            event.date <= new Date()
        ) {
            const error = new Error(
                'El evento ya finalizó'
            );

            error.statusCode = 400;
            throw error;
        }


        // Evitar inscripción activa duplicada
        const existingTicket =
            await ticketsRepository
                .findActiveByUserAndEvent(
                    userId,
                    eventId
                );


        if (existingTicket) {
            const error = new Error(
                'Ya tenés una inscripción activa para este evento'
            );

            error.statusCode = 409;
            throw error;
        }


        // Calcular cupos ocupados
        const occupiedCapacity =
            await ticketsRepository
                .getOccupiedCapacity(
                    eventId
                );


        const availableCapacity =
            event.capacity -
            occupiedCapacity;


        // Validar disponibilidad
        if (
            availableCapacity <
            quantity
        ) {
            const error = new Error(
                `No hay cupos suficientes. Cupos disponibles: ${availableCapacity}`
            );

            error.statusCode = 409;
            throw error;
        }


        // Generar código de reserva
        const reservationCode =
            crypto.randomUUID();


        // Crear inscripción
        const ticket =
            await ticketsRepository
                .createTicket({
                    user: userId,
                    event: eventId,
                    quantity,
                    status:
                        TICKET_STATUS.CONFIRMED,
                    reservationCode
                });


        // Enviar email de confirmación
        await mailService
            .sendTicketConfirmation(
                user,
                event,
                ticket
            );


        return ticket;
    }


    async getMyTickets(userId) {
        return await ticketsRepository
            .findByUser(
                userId
            );
    }


    async getTicketsByEvent(eventId) {
        const event =
            await eventsService
                .getEventById(
                    eventId
                );


        const tickets =
            await ticketsRepository
                .findByEvent(
                    eventId
                );


        return {
            event,
            tickets
        };
    }


    async cancelTicket(
        ticketId,
        user
    ) {
        const userId = user._id;
        const userRole = user.role;


        // Validar ObjectId del ticket
        if (
            !mongoose.Types.ObjectId.isValid(
                ticketId
            )
        ) {
            const error = new Error(
                'ID de ticket inválido'
            );

            error.statusCode = 400;
            throw error;
        }


        // Buscar ticket
        const ticket =
            await ticketsRepository
                .findById(
                    ticketId
                );


        if (!ticket) {
            const error = new Error(
                'Ticket no encontrado'
            );

            error.statusCode = 404;
            throw error;
        }


        // Solo el dueño del ticket o un admin
        if (
            userRole !== ROLES.ADMIN &&
            ticket.user.toString() !==
                userId.toString()
        ) {
            const error = new Error(
                'No tenés permisos para cancelar este ticket'
            );

            error.statusCode = 403;
            throw error;
        }


        // No permitir cancelar dos veces
        if (
            ticket.status ===
            TICKET_STATUS.CANCELLED
        ) {
            const error = new Error(
                'El ticket ya está cancelado'
            );

            error.statusCode = 409;
            throw error;
        }


        // Buscar evento
        const event =
            await eventsService
                .getEventById(
                    ticket.event.toString()
                );


        // Buscar al verdadero dueño del ticket.
        // Es importante si quien cancela es un admin.
        const ticketOwner =
            await usersService.getUserById(
                ticket.user.toString()
            );


        if (!ticketOwner) {
            const error = new Error(
                'Usuario asociado al ticket no encontrado'
            );

            error.statusCode = 404;
            throw error;
        }


        // Cancelación lógica
        const cancelledTicket =
            await ticketsRepository
                .updateTicket(
                    ticketId,
                    {
                        status:
                            TICKET_STATUS.CANCELLED,
                        cancelledAt:
                            new Date()
                    }
                );


        // El email siempre se envía
        // al dueño de la inscripción
        await mailService
            .sendTicketCancellation(
                ticketOwner,
                event,
                cancelledTicket
            );


        return cancelledTicket;
    }
}


export const ticketsService =
    new TicketsService();
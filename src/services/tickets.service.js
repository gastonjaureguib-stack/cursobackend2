import crypto from 'crypto';
import mongoose from 'mongoose';

import {
    ticketsRepository
} from '../repositories/tickets.repository.js';

import {
    eventsService
} from './events.service.js';

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

        // Validar quantity
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

        // Buscar y validar existencia del evento
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

        // El evento no puede haber finalizado por fecha
        if (event.date <= new Date()) {
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

            error.statusCode = 400;
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

        // Comprobar disponibilidad
        if (availableCapacity < quantity) {
            const error = new Error(
                `No hay cupos suficientes. Cupos disponibles: ${availableCapacity}`
            );

            error.statusCode = 400;
            throw error;
        }

        // Generar código único de reserva
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
        await mailService.sendTicketConfirmation(
            user,
            event,
            ticket
        );

        return ticket;
    }

    async getMyTickets(userId) {
        return await ticketsRepository.findByUser(
            userId
        );
    }

    async getTicketsByEvent(eventId) {
        const event =
            await eventsService.getEventById(
                eventId
            );

        const tickets =
            await ticketsRepository.findByEvent(
                eventId
            );

        return {
            event,
            tickets
        };
    }

    async cancelTicket(
        ticketId,
        userId,
        userRole
    ) {
        // Validar formato del ObjectId
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
            await ticketsRepository.findById(
                ticketId
            );

        if (!ticket) {
            const error = new Error(
                'Ticket no encontrado'
            );

            error.statusCode = 404;
            throw error;
        }

        // Solo el dueño o un admin pueden cancelarlo
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

        // No se puede cancelar dos veces
        if (
            ticket.status ===
            TICKET_STATUS.CANCELLED
        ) {
            const error = new Error(
                'El ticket ya está cancelado'
            );

            error.statusCode = 400;
            throw error;
        }

        // Cancelación lógica: no eliminamos el ticket
        return await ticketsRepository.updateTicket(
            ticketId,
            {
                status:
                    TICKET_STATUS.CANCELLED,
                cancelledAt: new Date()
            }
        );
    }
}

export const ticketsService =
    new TicketsService();
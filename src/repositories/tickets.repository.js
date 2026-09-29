import { ticketsDAO } from '../dao/tickets.dao.js';

export class TicketsRepository {
    async createTicket(ticketData) {
        return await ticketsDAO.create(
            ticketData
        );
    }

    async findById(id) {
        return await ticketsDAO.findById(
            id
        );
    }

    async findByUser(userId) {
        return await ticketsDAO.findByUser(
            userId
        );
    }

    async findByEvent(eventId) {
        return await ticketsDAO.findByEvent(
            eventId
        );
    }

    async findActiveByUserAndEvent(
        userId,
        eventId
    ) {
        return await ticketsDAO.findActiveByUserAndEvent(
            userId,
            eventId
        );
    }

    async getOccupiedCapacity(eventId) {
        return await ticketsDAO.getOccupiedCapacity(
            eventId
        );
    }

    async updateTicket(
        id,
        ticketData
    ) {
        return await ticketsDAO.updateById(
            id,
            ticketData
        );
    }
}

export const ticketsRepository =
    new TicketsRepository();
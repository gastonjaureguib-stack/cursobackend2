import { eventsDAO } from '../dao/events.dao.js';

export class EventsRepository {
    async findAll(options) {
        return await eventsDAO.findAll(
            options
        );
    }

    async findById(id) {
        return await eventsDAO.findById(
            id
        );
    }

    async createEvent(eventData) {
        return await eventsDAO.create(
            eventData
        );
    }

    async updateEvent(id, eventData) {
        return await eventsDAO.updateById(
            id,
            eventData
        );
    }
}

export const eventsRepository =
    new EventsRepository();
import { eventsDAO } from '../dao/events.dao.js';

export class EventsRepository {
    async findAll() {
        return await eventsDAO.findAll();
    }

    async findById(id) {
        return await eventsDAO.findById(id);
    }

    async createEvent(eventData) {
        return await eventsDAO.create(eventData);
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
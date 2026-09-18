import { EventModel } from '../models/Event.js';

export class EventsDAO {
    async findAll() {
        return await EventModel.find();
    }

    async findById(id) {
        return await EventModel.findById(id);
    }

    async create(eventData) {
        return await EventModel.create(eventData);
    }

    async updateById(id, eventData) {
        return await EventModel.findByIdAndUpdate(
            id,
            eventData,
            { new: true }
        );
    }
}

export const eventsDAO = new EventsDAO();
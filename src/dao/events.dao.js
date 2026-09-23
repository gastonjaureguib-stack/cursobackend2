import { EventModel } from '../models/Event.js';

export class EventsDAO {
    async findAll({
        filter = {},
        page = 1,
        limit = 10,
        sort = { date: 1 }
    } = {}) {
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            EventModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit),

            EventModel.countDocuments(filter)
        ]);

        return {
            events,
            total
        };
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
            {
                new: true,
                runValidators: true
            }
        );
    }
}

export const eventsDAO = new EventsDAO();
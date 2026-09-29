import mongoose from 'mongoose';

import { TicketModel } from '../models/Ticket.js';

export class TicketsDAO {
    async create(ticketData) {
        return await TicketModel.create(
            ticketData
        );
    }

    async findById(id) {
        return await TicketModel.findById(
            id
        );
    }

    async findByUser(userId) {
        return await TicketModel.find({
            user: userId
        }).populate(
            'event',
            'title date location'
        );
    }

    async findByEvent(eventId) {
        return await TicketModel.find({
            event: eventId
        });
    }

    async findActiveByUserAndEvent(
        userId,
        eventId
    ) {
        return await TicketModel.findOne({
            user: userId,
            event: eventId,
            status: {
                $ne: 'cancelled'
            }
        });
    }

    async getOccupiedCapacity(eventId) {
        const result =
            await TicketModel.aggregate([
                {
                    $match: {
                        event:
                            new mongoose.Types.ObjectId(
                                eventId
                            ),
                        status: {
                            $ne: 'cancelled'
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: '$quantity'
                        }
                    }
                }
            ]);

        return result.length > 0
            ? result[0].total
            : 0;
    }

    async updateById(
        id,
        ticketData
    ) {
        return await TicketModel.findByIdAndUpdate(
            id,
            ticketData,
            {
                new: true,
                runValidators: true
            }
        );
    }
}

export const ticketsDAO =
    new TicketsDAO();
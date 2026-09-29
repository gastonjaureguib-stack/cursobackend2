import mongoose from 'mongoose';

import {
    TICKET_STATUS,
    TICKET_STATUS_VALUES
} from '../constants/ticketStatus.js';

const ticketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'events',
            required: true
        },

        status: {
            type: String,
            enum: TICKET_STATUS_VALUES,
            default: TICKET_STATUS.CONFIRMED
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        reservationCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        cancelledAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const TicketModel = mongoose.model(
    'tickets',
    ticketSchema
);
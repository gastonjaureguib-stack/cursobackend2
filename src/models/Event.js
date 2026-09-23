import mongoose from 'mongoose';

import {
    EVENT_STATUS,
    EVENT_STATUS_VALUES
} from '../constants/eventStatus.js';

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        capacity: {
            type: Number,
            required: true,
            min: 1
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: EVENT_STATUS_VALUES,
            default: EVENT_STATUS.DRAFT
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const EventModel = mongoose.model(
    'events',
    eventSchema
);
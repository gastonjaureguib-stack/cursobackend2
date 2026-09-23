import {
    eventsRepository
} from '../repositories/events.repository.js';

import {
    EVENT_STATUS,
    EVENT_STATUS_VALUES
} from '../constants/eventStatus.js';

export class EventsService {
    async getEvents(query = {}) {
        const {
            status,
            category,
            location,
            dateFrom,
            dateTo,
            page = 1,
            limit = 10,
            sort = 'date'
        } = query;

        const filter = {};

        if (status) {
            if (
                !EVENT_STATUS_VALUES.includes(status)
            ) {
                const error = new Error(
                    'Estado de evento inválido'
                );
                error.statusCode = 400;
                throw error;
            }

            filter.status = status;
        }

        if (category) {
            filter.category = category;
        }

        if (location) {
            filter.location = location;
        }

        if (dateFrom || dateTo) {
            filter.date = {};

            if (dateFrom) {
                const from = new Date(dateFrom);

                if (
                    Number.isNaN(
                        from.getTime()
                    )
                ) {
                    const error = new Error(
                        'dateFrom inválido'
                    );
                    error.statusCode = 400;
                    throw error;
                }

                filter.date.$gte = from;
            }

            if (dateTo) {
                const to = new Date(dateTo);

                if (
                    Number.isNaN(
                        to.getTime()
                    )
                ) {
                    const error = new Error(
                        'dateTo inválido'
                    );
                    error.statusCode = 400;
                    throw error;
                }

                filter.date.$lte = to;
            }

            if (
                dateFrom &&
                dateTo &&
                filter.date.$gte >
                    filter.date.$lte
            ) {
                const error = new Error(
                    'dateFrom no puede ser posterior a dateTo'
                );
                error.statusCode = 400;
                throw error;
            }
        }

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);

        if (
            !Number.isInteger(parsedPage) ||
            parsedPage < 1
        ) {
            const error = new Error(
                'page debe ser un número entero mayor a 0'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            !Number.isInteger(parsedLimit) ||
            parsedLimit < 1
        ) {
            const error = new Error(
                'limit debe ser un número entero mayor a 0'
            );
            error.statusCode = 400;
            throw error;
        }

        const allowedSortFields = [
            'date',
            'title',
            'category',
            'price',
            'capacity',
            'createdAt'
        ];

        let sortDirection = 1;
        let sortField = sort;

        if (
            typeof sort !== 'string'
        ) {
            const error = new Error(
                'Ordenamiento inválido'
            );
            error.statusCode = 400;
            throw error;
        }

        if (sort.startsWith('-')) {
            sortDirection = -1;
            sortField = sort.slice(1);
        }

        if (
            !allowedSortFields.includes(
                sortField
            )
        ) {
            const error = new Error(
                'Campo de ordenamiento inválido'
            );
            error.statusCode = 400;
            throw error;
        }

        const result =
            await eventsRepository.findAll({
                filter,
                page: parsedPage,
                limit: parsedLimit,
                sort: {
                    [sortField]:
                        sortDirection
                }
            });

        return {
            data: result.events,
            page: parsedPage,
            limit: parsedLimit,
            total: result.total,
            totalPages: Math.ceil(
                result.total /
                    parsedLimit
            )
        };
    }

    async getEventById(id) {
        const event =
            await eventsRepository.findById(
                id
            );

        if (!event) {
            const error = new Error(
                'Evento no encontrado'
            );
            error.statusCode = 404;
            throw error;
        }

        return event;
    }

    async createEvent(eventData) {
        const {
            title,
            description,
            category,
            date,
            location,
            capacity,
            price,
            organizer
        } = eventData;

        if (
            !title?.trim() ||
            !description?.trim() ||
            !category?.trim() ||
            !date ||
            !location?.trim() ||
            capacity === undefined ||
            price === undefined
        ) {
            const error = new Error(
                'Faltan campos obligatorios'
            );
            error.statusCode = 400;
            throw error;
        }

        const eventDate =
            new Date(date);

        if (
            Number.isNaN(
                eventDate.getTime()
            ) ||
            eventDate <= new Date()
        ) {
            const error = new Error(
                'La fecha del evento debe ser futura'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            typeof capacity !== 'number' ||
            capacity <= 0
        ) {
            const error = new Error(
                'La capacidad debe ser mayor a 0'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            typeof price !== 'number' ||
            price < 0
        ) {
            const error = new Error(
                'El precio no puede ser negativo'
            );
            error.statusCode = 400;
            throw error;
        }

        return await eventsRepository.createEvent({
            title,
            description,
            category,
            date: eventDate,
            location,
            capacity,
            price,
            organizer
        });
    }

    async updateEvent(
        id,
        eventData
    ) {
        const event =
            await this.getEventById(id);

        if (
            event.status ===
            EVENT_STATUS.CANCELLED
        ) {
            const error = new Error(
                'No se puede modificar un evento cancelado'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            eventData.title !== undefined &&
            !eventData.title?.trim()
        ) {
            const error = new Error(
                'El título es obligatorio'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            eventData.description !== undefined &&
            !eventData.description?.trim()
        ) {
            const error = new Error(
                'La descripción es obligatoria'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            eventData.category !== undefined &&
            !eventData.category?.trim()
        ) {
            const error = new Error(
                'La categoría es obligatoria'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            eventData.location !== undefined &&
            !eventData.location?.trim()
        ) {
            const error = new Error(
                'La ubicación es obligatoria'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            eventData.date !== undefined
        ) {
            const eventDate =
                new Date(
                    eventData.date
                );

            if (
                Number.isNaN(
                    eventDate.getTime()
                ) ||
                eventDate <= new Date()
            ) {
                const error = new Error(
                    'La fecha del evento debe ser futura'
                );
                error.statusCode = 400;
                throw error;
            }

            eventData.date =
                eventDate;
        }

        if (
            eventData.capacity !== undefined &&
            (
                typeof eventData.capacity !==
                    'number' ||
                eventData.capacity <= 0
            )
        ) {
            const error = new Error(
                'La capacidad debe ser mayor a 0'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            eventData.price !== undefined &&
            (
                typeof eventData.price !==
                    'number' ||
                eventData.price < 0
            )
        ) {
            const error = new Error(
                'El precio no puede ser negativo'
            );
            error.statusCode = 400;
            throw error;
        }

        return await eventsRepository.updateEvent(
            id,
            eventData
        );
    }

    async updateEventStatus(
        id,
        newStatus
    ) {
        if (
            !EVENT_STATUS_VALUES.includes(
                newStatus
            )
        ) {
            const error = new Error(
                'Estado de evento inválido'
            );
            error.statusCode = 400;
            throw error;
        }

        const event =
            await this.getEventById(id);

        if (
            event.status ===
            EVENT_STATUS.CANCELLED
        ) {
            const error = new Error(
                'No se puede cambiar el estado de un evento cancelado'
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            newStatus ===
            EVENT_STATUS.PUBLISHED
        ) {
            if (
                event.status ===
                    EVENT_STATUS.FINISHED ||
                event.date <= new Date()
            ) {
                const error = new Error(
                    'No se puede publicar un evento finalizado'
                );
                error.statusCode = 400;
                throw error;
            }
        }

        return await eventsRepository.updateEvent(
            id,
            {
                status: newStatus
            }
        );
    }
}

export const eventsService =
    new EventsService();
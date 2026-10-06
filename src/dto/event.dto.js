export class EventDTO {
    constructor(event) {
        this.id = event._id;
        this.title = event.title;
        this.description = event.description;
        this.category = event.category;
        this.date = event.date;
        this.location = event.location;
        this.capacity = event.capacity;
        this.price = event.price;
        this.status = event.status;

        if (event.organizer) {
            if (
                typeof event.organizer === 'object' &&
                event.organizer._id
            ) {
                this.organizer = {
                    id: event.organizer._id,
                    first_name: event.organizer.first_name,
                    last_name: event.organizer.last_name,
                    email: event.organizer.email
                };
            } else {
                this.organizer = event.organizer;
            }
        }

        if (event.createdAt) {
            this.createdAt = event.createdAt;
        }

        if (event.updatedAt) {
            this.updatedAt = event.updatedAt;
        }
    }
}
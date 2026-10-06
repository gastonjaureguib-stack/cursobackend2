export class TicketDTO {
    constructor(ticket) {
        this.id = ticket._id;

        if (ticket.user) {
            if (
                typeof ticket.user === 'object' &&
                ticket.user._id
            ) {
                this.user = {
                    id: ticket.user._id,
                    first_name: ticket.user.first_name,
                    last_name: ticket.user.last_name,
                    email: ticket.user.email,
                    role: ticket.user.role
                };
            } else {
                this.user = ticket.user;
            }
        }

        if (ticket.event) {
            if (
                typeof ticket.event === 'object' &&
                ticket.event._id
            ) {
                this.event = {
                    id: ticket.event._id,
                    title: ticket.event.title,
                    date: ticket.event.date,
                    location: ticket.event.location
                };
            } else {
                this.event = ticket.event;
            }
        }

        this.status = ticket.status;
        this.quantity = ticket.quantity;
        this.reservationCode =
            ticket.reservationCode;

        if (ticket.createdAt) {
            this.createdAt = ticket.createdAt;
        }

        if (ticket.cancelledAt) {
            this.cancelledAt =
                ticket.cancelledAt;
        }
    }
}
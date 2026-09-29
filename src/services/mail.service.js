import {
    mailTransporter
} from '../config/mail.config.js';

export class MailService {
    async sendTicketConfirmation(
        user,
        event,
        ticket
    ) {
        await mailTransporter.sendMail({
            from: process.env.MAIL_FROM,
            to: user.email,
            subject:
                `Confirmación de inscripción - ${event.title}`,
            html: `
                <h2>Inscripción confirmada</h2>

                <p>
                    Hola ${user.first_name},
                    tu inscripción fue confirmada correctamente.
                </p>

                <h3>${event.title}</h3>

                <p>
                    <strong>Fecha:</strong>
                    ${event.date.toLocaleString()}
                </p>

                <p>
                    <strong>Lugar:</strong>
                    ${event.location}
                </p>

                <p>
                    <strong>Cantidad:</strong>
                    ${ticket.quantity}
                </p>

                <p>
                    <strong>Código de reserva:</strong>
                    ${ticket.reservationCode}
                </p>
            `
        });
    }
}

export const mailService =
    new MailService();
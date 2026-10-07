import 'dotenv/config';

import app from './app.js';
import {
    connectDB
} from './config/db.js';


const requiredEnvVariables = [
    'PORT',
    'NODE_ENV',
    'MONGO_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USER',
    'MAIL_PASS',
    'MAIL_FROM'
];


const validateEnvironment = () => {
    const missingVariables =
        requiredEnvVariables.filter(
            (variable) =>
                !process.env[variable]
        );


    if (missingVariables.length > 0) {
        throw new Error(
            `Faltan variables de entorno obligatorias: ${missingVariables.join(', ')}`
        );
    }
};


const startServer = async () => {
    try {
        validateEnvironment();

        await connectDB();

        const PORT =
            Number(process.env.PORT);

        if (
            !Number.isInteger(PORT) ||
            PORT <= 0
        ) {
            throw new Error(
                'PORT debe ser un número válido mayor a 0'
            );
        }


        app.listen(PORT, () => {
            console.log(
                `Servidor activo en el puerto ${PORT}`
            );
        });

    } catch (error) {
        console.error(
            'Error al iniciar el servidor:',
            error.message
        );

        process.exit(1);
    }
};


startServer();
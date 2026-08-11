import express from 'express';

import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';

const app = express();

// Permite que Express reciba información en formato JSON
app.use(express.json());

// Ruta para comprobar que el servidor está funcionando
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Servidor activo'
    });
});

// Rutas de la aplicación
app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);

export default app;
import { sessionsService } from '../services/sessions.service.js';

export const getSessionStatus = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Sessions disponible'
    });
};

export const register = async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password
        } = req.body;

        // Validar campos obligatorios
        if (
            !first_name?.trim() ||
            !last_name?.trim() ||
            !email?.trim() ||
            !password
        ) {
            const error = new Error(
                'Faltan campos obligatorios'
            );

            error.statusCode = 400;
            throw error;
        }

        // Validar formato de email
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            const error = new Error(
                'Formato de email inválido'
            );

            error.statusCode = 400;
            throw error;
        }

        // Validar longitud mínima de contraseña
        if (password.length < 8) {
            const error = new Error(
                'La contraseña debe tener al menos 8 caracteres'
            );

            error.statusCode = 400;
            throw error;
        }

        const user =
            await sessionsService.registerUser({
                first_name,
                last_name,
                email,
                password
            });

        return res.status(201).json({
            status: 'success',
            payload: user
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Validar campos obligatorios
        if (!email?.trim() || !password) {
            const error = new Error(
                'Faltan campos obligatorios'
            );

            error.statusCode = 400;
            throw error;
        }

        const token =
            await sessionsService.loginUser({
                email,
                password
            });

        res.cookie(
            'currentUser',
            token,
            {
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 3600000,
                secure:
                    process.env.NODE_ENV ===
                    'production'
            }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Login correcto'
        });
    } catch (error) {
        next(error);
    }
};

export const current = (req, res) => {
    return res.status(200).json({
        status: 'success',
        payload: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
};

export const logout = (req, res) => {
    res.clearCookie(
        'currentUser',
        {
            httpOnly: true,
            sameSite: 'lax',
            secure:
                process.env.NODE_ENV ===
                'production'
        }
    );

    return res.status(200).json({
        status: 'success',
        message: 'Sesión cerrada'
    });
};
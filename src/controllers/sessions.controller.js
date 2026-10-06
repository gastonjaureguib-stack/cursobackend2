import { generateToken } from '../utils/jwt.js';
import { UserDTO } from '../dto/user.dto.js';


export const getSessionStatus = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Sessions disponible'
    });
};


export const register = (req, res) => {
    const userDTO = new UserDTO(req.user);

    return res.status(201).json({
        status: 'success',
        payload: userDTO
    });
};


export const login = (req, res) => {
    const token = generateToken(req.user);

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
};


export const current = (req, res) => {
    const userDTO = new UserDTO(req.user);

    return res.status(200).json({
        status: 'success',
        payload: userDTO
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
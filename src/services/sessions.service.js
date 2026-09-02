import { usersRepository } from '../repositories/users.repository.js';

import {
    createHash,
    isValidPassword
} from '../utils/hash.js';

import { generateToken } from '../utils/jwt.js';

export class SessionsService {
    async registerUser({
        first_name,
        last_name,
        email,
        password
    }) {
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser =
            await usersRepository.findByEmail(normalizedEmail);

        if (existingUser) {
            const error = new Error(
                'El email ya está registrado'
            );

            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await createHash(password);

        const newUser =
            await usersRepository.createUser({
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: 'user'
            });

        return {
            id: newUser._id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            role: newUser.role
        };
    }

    async loginUser({
        email,
        password
    }) {
        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await usersRepository.findByEmail(
                normalizedEmail
            );

        if (!user) {
            const error = new Error(
                'Credenciales inválidas'
            );

            error.statusCode = 401;
            throw error;
        }

        const validPassword =
            await isValidPassword(
                password,
                user.password
            );

        if (!validPassword) {
            const error = new Error(
                'Credenciales inválidas'
            );

            error.statusCode = 401;
            throw error;
        }

        const token = generateToken(user);

        return token;
    }
}

export const sessionsService =
    new SessionsService();
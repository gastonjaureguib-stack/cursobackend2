import { usersRepository } from '../repositories/users.repository.js';
import {
    createHash,
    isValidPassword
} from '../utils/hash.js';
import { ROLES } from '../constants/roles.js';

export class UsersService {

    async getUsers() {
        return await usersRepository.findAll();
    }

    async getUserById(id) {
        return await usersRepository.findById(id);
    }

    async registerUser({
        first_name,
        last_name,
        email,
        password
    }) {
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

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            const error = new Error(
                'Formato de email inválido'
            );
            error.statusCode = 400;
            throw error;
        }

        if (password.length < 8) {
            const error = new Error(
                'La contraseña debe tener al menos 8 caracteres'
            );
            error.statusCode = 400;
            throw error;
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await usersRepository.findByEmail(
                normalizedEmail
            );

        if (existingUser) {
            const error = new Error(
                'El email ya está registrado'
            );
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword =
            await createHash(password);

        return await usersRepository.createUser({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: ROLES.USER
        });
    }

    async loginUser(email, password) {
        if (!email?.trim() || !password) {
            const error = new Error(
                'Credenciales inválidas'
            );
            error.statusCode = 401;
            throw error;
        }

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

        return user;
    }
}

export const usersService = new UsersService();
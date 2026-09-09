import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy } from 'passport-jwt';

import { usersRepository } from '../repositories/users.repository.js';
import {
    createHash,
    isValidPassword
} from '../utils/hash.js';


// Extraer JWT desde la cookie

const cookieExtractor = (req) => {
    let token = null;

    if (req && req.cookies) {
        token = req.cookies.currentUser;
    }

    return token;
};


// Estrategia register

passport.use(
    'register',
    new LocalStrategy(
        {
            usernameField: 'email',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                const {
                    first_name,
                    last_name
                } = req.body;

                if (
                    !first_name?.trim() ||
                    !last_name?.trim() ||
                    !email?.trim() ||
                    !password
                ) {
                    return done(null, false, {
                        message:
                            'Faltan campos obligatorios'
                    });
                }

                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(email.trim())) {
                    return done(null, false, {
                        message:
                            'Formato de email inválido'
                    });
                }

                if (password.length < 8) {
                    return done(null, false, {
                        message:
                            'La contraseña debe tener al menos 8 caracteres'
                    });
                }

                const normalizedEmail =
                    email.trim().toLowerCase();

                const existingUser =
                    await usersRepository.findByEmail(
                        normalizedEmail
                    );

                if (existingUser) {
                    return done(null, false, {
                        message:
                            'El email ya está registrado'
                    });
                }

                const hashedPassword =
                    await createHash(password);

                const newUser =
                    await usersRepository.createUser({
                        first_name: first_name.trim(),
                        last_name: last_name.trim(),
                        email: normalizedEmail,
                        password: hashedPassword,
                        role: 'user'
                    });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    )
);


// Estrategia login

passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email'
        },
        async (email, password, done) => {
            try {
                const normalizedEmail =
                    email.trim().toLowerCase();

                const user =
                    await usersRepository.findByEmail(
                        normalizedEmail
                    );

                if (!user) {
                    return done(null, false, {
                        message:
                            'Credenciales inválidas'
                    });
                }

                const validPassword =
                    await isValidPassword(
                        password,
                        user.password
                    );

                if (!validPassword) {
                    return done(null, false, {
                        message:
                            'Credenciales inválidas'
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);


// Estrategia current

passport.use(
    'current',
    new JwtStrategy(
        {
            jwtFromRequest: cookieExtractor,
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwtPayload, done) => {
            try {
                const user =
                    await usersRepository.findById(
                        jwtPayload.id
                    );

                if (!user) {
                    return done(null, false, {
                        message: 'No autenticado'
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);
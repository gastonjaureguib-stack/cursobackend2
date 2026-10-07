import passport from 'passport';

import {
    Strategy as LocalStrategy
} from 'passport-local';

import {
    Strategy as JwtStrategy
} from 'passport-jwt';

import {
    usersService
} from '../services/users.service.js';


const cookieExtractor = (req) => {
    let token = null;

    if (req && req.cookies) {
        token =
            req.cookies.currentUser;
    }

    return token;
};


passport.use(
    'register',
    new LocalStrategy(
        {
            usernameField: 'email',
            passReqToCallback: true
        },
        async (
            req,
            email,
            password,
            done
        ) => {
            try {
                const user =
                    await usersService
                        .registerUser({
                            first_name:
                                req.body.first_name,
                            last_name:
                                req.body.last_name,
                            email,
                            password
                        });


                return done(
                    null,
                    user
                );

            } catch (error) {

                if (error.statusCode) {
                    return done(
                        null,
                        false,
                        {
                            message:
                                error.message,
                            statusCode:
                                error.statusCode
                        }
                    );
                }


                return done(error);
            }
        }
    )
);


passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email'
        },
        async (
            email,
            password,
            done
        ) => {
            try {
                const user =
                    await usersService
                        .loginUser(
                            email,
                            password
                        );


                return done(
                    null,
                    user
                );

            } catch (error) {

                if (error.statusCode) {
                    return done(
                        null,
                        false,
                        {
                            message:
                                error.message,
                            statusCode:
                                error.statusCode
                        }
                    );
                }


                return done(error);
            }
        }
    )
);


passport.use(
    'current',
    new JwtStrategy(
        {
            jwtFromRequest:
                cookieExtractor,

            secretOrKey:
                process.env.JWT_SECRET
        },
        async (
            jwtPayload,
            done
        ) => {
            try {
                const user =
                    await usersService
                        .getUserById(
                            jwtPayload.id
                        );


                if (!user) {
                    return done(
                        null,
                        false,
                        {
                            message:
                                'No autenticado'
                        }
                    );
                }


                return done(
                    null,
                    user
                );

            } catch (error) {
                return done(error);
            }
        }
    )
);
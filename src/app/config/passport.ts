/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../modules/user/user.model";
import bcryptjs from 'bcryptjs';
import config from '../config/env';
import { Role } from "../modules/user/user.interface";


passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email }).select('+password')

            if (!isUserExist) {
                return done(null, false, { message: 'User does not exist' });
            }

            const isGoogleAuthenticated = isUserExist.authProviders?.some(providerObjects => providerObjects.provider == 'google');

            if (isGoogleAuthenticated && !isUserExist.password) {
                return done(null, false, { message: 'You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password' });
            }

            const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string);
            // console.log(isPasswordMatched)

            if (!isPasswordMatched) {
                done(null, false, { message: 'Password does not match' });
            }

            return done(null, isUserExist);

        } catch (error) {
            console.log(error);
            done(error);
        }
    }
));

passport.use(new GoogleStrategy(
    {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACK_URL
    },
    async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) => {
        try {
            const email = profile.emails?.[0].value;

            if (!email) {
                done(null, false, { message: 'Email not found...' });
            }

            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    email,
                    name: profile.displayName,
                    picture: profile.photos?.[0].value,
                    role: Role.SENDER,
                    authProviders: [
                        {
                            provider: 'google',
                            providerId: profile.id,
                            email
                        }
                    ]
                });
            }

            return done(null, user);

        } catch (error) {
            console.log(error);
            done(error);
        }
    }
));

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user);

    } catch (error) {
        console.log(error);
        done(error);
    }
});
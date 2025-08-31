/* eslint-disable no-console */
import { User } from "../modules/user/user.model";
import config from '../config/env';
import AppError from "../errorHelper/AppError";
import httpStatus from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";

export const seedAdmin = async () => {
    try {
        const isAdminExist = await User.findOne({ email: config.ADMIN_EMAIL });

        if (isAdminExist) {
            throw new AppError(httpStatus.BAD_REQUEST, 'Admin already exist')
        }

        console.log('Trying to create admin');

        const hashedPassword = await bcryptjs.hash(config.ADMIN_PASSWORD, Number(config.BCRYPT_SALT_ROUND));

        const authProvider: IAuthProvider = {
            provider: 'credentials',
            providerId: config.ADMIN_EMAIL
        };

        const payload: IUser = {
            name: 'Admin',
            role: Role.ADMIN,
            email: config.ADMIN_EMAIL,
            password: hashedPassword,
            authProviders: [authProvider]
        };

        const admin = await User.create(payload);
        console.log('Admin created successfully');
        console.log(admin);

    } catch (error) {
        console.log(error);
    }
};
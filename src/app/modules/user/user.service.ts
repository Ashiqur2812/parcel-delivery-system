import AppError from "../../errorHelper/AppError";
import { AuthProviderType, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import config from '../../config/env';


const createUser = async (payload: Partial<IUser>) => {
    const { email, password, role = Role.SENDER, ...rest } = payload;

    const isUserExist = await User.findOne({ email });
    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already exist');
    }

    let hashedPassword: string | undefined;
    if (password) {
        hashedPassword = await bcryptjs.hash(password, Number(config.BCRYPT_SALT_ROUND));
    }

    const authProvider = {
        provider: AuthProviderType.CREDENTIALS,
        providerId: email as string,
        email
    };

    const user = await User.create({
        email,
        password: hashedPassword,
        role,
        authProviders: [authProvider],
        ...rest
    });

    return user;

};

export const userServices = {
    createUser
};
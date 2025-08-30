import AppError from "../../errorHelper/AppError";
import { AuthProviderType, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import config from '../../config/env';
import { JwtPayload } from "jsonwebtoken";


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

const updateUser = async (id: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const existingUser = await User.findById(id);

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const userId = decodedToken.id || decodedToken.userId;
    // check ownerShip of admin privileges
    if (userId !== id && userId.role !== Role.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own profile');
    }

    // only admin can change role and status
    if (payload.role && decodedToken.role !== Role.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, 'Only admin can change status');
    }

    // Hash password
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, Number(config.BCRYPT_SALT_ROUND));
    }

    const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    return updatedUser;
};

export const userServices = {
    createUser,
    updateUser
};
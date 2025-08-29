import { IUser, UserStatus } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import config from '../config/env';
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelper/AppError";
import httpStatus from 'http-status-codes';

export const createUserToken = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id?.toString(),
        email: user.email,
        role: user.role
    };

    const accessToken = generateToken(
        jwtPayload,
        config.JWT_ACCESS_SECRET,
        config.JWT_ACCESS_EXPIRES
    );

    const refreshToken = generateToken(
        jwtPayload,
        config.JWT_REFRESH_SECRET,
        config.JWT_REFRESH_EXPIRES
    );

    return {
        accessToken,
        refreshToken
    };
};

export const newAccessTokenWithRefreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = verifyToken(
        refreshToken,
        config.JWT_REFRESH_SECRET
    ) as JwtPayload;

    const isUserExist = await User.findOne({
        email: verifiedRefreshToken?.email
    });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist...');
    }

    if (isUserExist.status === UserStatus.BLOCKED ||
        isUserExist.status === UserStatus.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist}`);
    }

    const jwtPayload = {
        userId: isUserExist._id.toString(),
        email: isUserExist.email,
        role: isUserExist.role
    };

    const accessToken = generateToken(
        jwtPayload,
        config.JWT_ACCESS_SECRET,
        config.JWT_ACCESS_EXPIRES
    );

    return { accessToken };

};
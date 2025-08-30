/* eslint-disable no-console */
import AppError from "../../errorHelper/AppError";
import { newAccessTokenWithRefreshToken } from "../../utils/userToken";
import httpStatus from 'http-status-codes';
import { User } from "../user/user.model";
import bcryptjs from 'bcryptjs';
import config from '../../config/env';
import { JwtPayload } from "jsonwebtoken";

const getNewAccessToken = async (refreshToken: string) => {
    try {
        const { accessToken } = await newAccessTokenWithRefreshToken(refreshToken);
        return { accessToken };

    } catch (error) {
        console.error('Refresh Token error', error);
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
    }
};

const resetPassword = async (oldPassword: string, newPassword: string, decoded: JwtPayload): Promise<void> => {
    const user = await User.findById(decoded.userId);

    if (!user || !user.password) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found or password missing');
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User old password does not match');
    }

    user.password = await bcryptjs.hash(newPassword, Number(config.BCRYPT_SALT_ROUND));

    await user.save();
};

export const authService = {
    getNewAccessToken,
    resetPassword
};
import { Response } from "express";
import config from '../config/env'

export interface AuthToken {
    accessToken?: string,
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthToken) => {
    const isProduction = config.NODE_ENV === 'production';

    if (tokenInfo.accessToken) {
        res.cookie('accessToken', tokenInfo.accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict'
        });
    }

    if (tokenInfo.refreshToken) {
        res.cookie('refreshToken', tokenInfo.refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict'
        });
    }
};
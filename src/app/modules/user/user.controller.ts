/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { UserService } from "./user.service";
import httpStatus from 'http-status-codes';

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await UserService.createUser(req.body);
        res.status(httpStatus.CREATED).json({
            success: true,
            message: 'User created successfully',
            data: result
        });
    } catch (error: any) {
        res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to create user'
        });
    }
};

export const UserController = {
    createUser
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { UserService } from "./user.service";
import httpStatus from 'http-status-codes';
import { JwtPayload } from "jsonwebtoken";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/createAsync";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.createUser(req.body);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: 'User created successfully',
            data: user
        });
    } catch (error: any) {
        res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to create user'
        });
    }
});


const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await UserService.updateUser(id, req.body, req.user as JwtPayload);
        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: 'User updated successfully',
            data: user
        });
    } catch (error: any) {
        res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to update user'
        });
    }
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query;
        const result = await UserService.getAllUsers(query as Record<string, string>);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Users retrieved successfully',
            data: result.data,
            meta: result.meta
        });

    } catch (error: any) {
        res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to retrieve all users'
        });
    }
});

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const result = await UserService.getSingleUser(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'User retrieved successfully',
            data: result
        });
    } catch (error: any) {
        res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to retrieve user'
        });
    }
});

const blockUserController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { block } = req.body;

        const result = await UserService.blockUser(id, block);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: `User ${block ? 'blocked' : 'unblocked'} successfully`,
            data: result
        });

    } catch (error: any) {
        res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to update user status'
        });
    }
});

const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = await UserService.deleteUser(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'User deleted successfully',
            data: user
        });
    } catch (error: any) {
        res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to delete user'
        });
    }
});

export const UserController = {
    createUser,
    updateUser,
    getAllUsers,
    getSingleUser,
    blockUserController,
    deleteUser
};
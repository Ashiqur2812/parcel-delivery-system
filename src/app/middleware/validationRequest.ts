import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodRawShape } from "zod";

export type AnyZodObject = ZodObject<ZodRawShape>;

export const validateRequest = (ZodSchema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedData = await ZodSchema.parseAsync(req.body);
        req.body = parsedData;
        next();
    } catch (error) {
        next(error);
    }
};
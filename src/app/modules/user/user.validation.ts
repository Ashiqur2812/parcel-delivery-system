import z from "zod";
import { Role, UserStatus } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z
        .string({ message: 'Name must be string' })
        .min(2, { message: 'Name must be 2 characters long' })
        .max(50, { message: 'Name cannot exist more than 50 characters' }),

    email: z.string().email({ message: 'Invalid email address' }),

    password: z
        .string({ message: 'password must be string' })
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter",
        })
        .regex(/[0-9]/, {
            message: "Password must contain at least one number",
        })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, {
            message: "Password must contain at least one special character",
        }),

    phone: z
        .string({ message: 'Phone number must be string' })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message:
                "Phone number must be valid for Bangladesh (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)",
        })
        .optional(),

    role: z.enum([Role.ADMIN, Role.SENDER, Role.RECEIVER]).default(Role.SENDER),

    address: z
        .object({
            street: z.string().optional(),
            city: z.string().optional(),
            district: z.string().optional(),
            postalCode: z.string().optional()
        })
});


export const updateUserZodSchema = z.object({
    name: z
        .string({ message: 'Name must be string' })
        .min(2, { message: 'Name must be 2 characters long' })
        .max(50, { message: 'Name cannot exist more than 50 characters' })
        .optional(),

    email: z.string().email({ message: 'Invalid email address' }).optional(),

    password: z
        .string({ message: 'password must be string' })
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter",
        })
        .regex(/[0-9]/, {
            message: "Password must contain at least one number",
        })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, {
            message: "Password must contain at least one special character",
        })
        .optional(),

    phone: z
        .string({ message: 'Phone number must be string' })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message:
                "Phone number must be valid for Bangladesh (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)",
        })
        .optional(),

    role: z
        .enum([Role.ADMIN, Role.SENDER, Role.RECEIVER]).default(Role.SENDER).optional(),

    status: z
        .enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED])
        .optional(),

    address: z
        .object({
            street: z.string().optional(),
            city: z.string().optional(),
            district: z.string().optional(),
            postalCode: z.string().optional()
        })
        .optional()
});

export const blockUserZodSchema = z.object({
    block: z
        .boolean()
        .refine((val) => typeof val === 'boolean',
            { message: 'block must be a boolean' }
        )
})


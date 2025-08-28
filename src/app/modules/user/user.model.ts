import { Schema } from "mongoose";
import { AuthProviderType, IUser } from "./user.interface";

const addressSchema = new Schema({
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    postalCode: { type: String, trim: true }
}, { _id: false });

const authProviderSchema = new Schema({
    provider: {
        type: String,
        enum: Object.values(AuthProviderType),
        required: true
    },
    providerId: {
        type: String,
        required: true
    },
    email: { type: String }
}, { _id: false });

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email",
        ]
    },
    phone: {
        type: String,
        required: function () {
            return !(this as IUser).authProviders?.length;
        },
        select: false,
        minLength: 8
    }
});
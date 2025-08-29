import { model, Schema } from "mongoose";
import { AuthProviderType, IUser, Role, UserStatus } from "./user.interface";


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
    },
    role: {
        type: String,
        enum: Object.values(Role),
        required: true,
        default: Role.SENDER
    },
    status: {
        type: String,
        enum: Object.values(UserStatus),
        default: UserStatus.ACTIVE
    },
    address: addressSchema,
    authProviders: {
        type: [authProviderSchema],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
});

userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

export const User = model<IUser>('User', userSchema);
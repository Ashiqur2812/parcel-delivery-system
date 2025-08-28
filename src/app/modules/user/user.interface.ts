export enum Role {
    ADMIN = 'ADMIN',
    SENDER = 'SENDER',
    RECEIVER = 'RECEIVER'
}

export enum AuthProviderType {
    GOOGLE = 'google',
    CREDENTIALS = 'credentials'
}

export interface IAuthProvider {
    provider: AuthProviderType,
    providerId: string,
    email?: string;
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED'
}

export interface IAddress {
    street?: string,
    city?: string,
    district?: string,
    postalCode?: string;
}

export interface IUser {
    _id?: string,
    name: string,
    email: string,
    phone?: string,
    password?: string,
    role: Role,
    authProviders?: IAuthProvider[],
    status?: UserStatus,
    address?: IAddress,
    createdAt?: string,
    updatedAt?: string;
}

export type UserResponse = Omit<IUser, 'password'> & {
    id: string;
};

export interface UserFilter {
    role?: Role,
    status?: UserStatus,
    search?: string;
}
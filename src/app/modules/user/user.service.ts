import AppError from "../../errorHelper/AppError";
import { IAuthProvider, IUser, Role, UserStatus } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import config from '../../config/env';
import { JwtPayload } from "jsonwebtoken";
import { userSearchAbleFields } from "./user.constant";
import { QueryBuilder } from "../../utils/queryBuilder";


const createUser = async (payload: Partial<IUser>) => {
    const { email, password, role = Role.SENDER, ...rest } = payload;

    const isUserExist = await User.findOne({ email }).select('+password');

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User already exist');
    }

    let hashedPassword: string | undefined;
    if (password) {
        hashedPassword = await bcryptjs.hash(password, Number(config.BCRYPT_SALT_ROUND));
    }
    // console.log(hashedPassword)

    const authProvider: IAuthProvider = {
        provider: 'credentials',
        providerId: email as string
    };

    const user = await User.create({
        email,
        password: hashedPassword,
        role,
        authProviders: [authProvider],
        ...rest
    });

    return user;

};

const updateUser = async (id: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const existingUser = await User.findById(id);

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const userId = decodedToken.id || decodedToken.userId;
    // check ownerShip of admin privileges
    if (userId !== id && userId.role !== Role.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, 'You can only update your own profile');
    }

    // only admin can change role and status
    if (payload.role && decodedToken.role !== Role.ADMIN) {
        throw new AppError(httpStatus.FORBIDDEN, 'Only admin can change status');
    }

    // Hash password
    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, Number(config.BCRYPT_SALT_ROUND));
    }

    const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(User.find(), query);

    const userData = queryBuilder
        .filter()
        .search(userSearchAbleFields)
        .sort()
        .paginate();

    const [data, meta] = await Promise.all([
        userData.build(),
        userData.getMeta()
    ]);

    return { data, meta };
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id);
    return {
        data: user
    };
};

const blockUser = async (id: string, block: boolean) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    user.status = block ? UserStatus.BLOCKED : UserStatus.ACTIVE;
    const result = await user.save();
    return result;
};

const deleteUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
};

export const UserService = {
    createUser,
    updateUser,
    getAllUsers,
    getSingleUser,
    blockUser,
    deleteUser
};

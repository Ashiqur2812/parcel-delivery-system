import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { ParcelRoutes } from "../modules/parcel/parcel.route";

export const router = Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/parcel',
        route: ParcelRoutes
    }
];

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

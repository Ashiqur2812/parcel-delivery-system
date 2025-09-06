import { JwtPayload } from "jsonwebtoken";
import { Role } from "../modules/user/user.interface";

export interface AuthPayload extends JwtPayload {
    _id: string;
    role: Role;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export {};

// import { JwtPayload } from "jsonwebtoken";
// import { Role } from "../modules/user/user.interface";

// // AuthPayload type
// export interface AuthPayload extends JwtPayload {
//     userId: string; 
//     role: Role;
// }

// declare global {
//     namespace Express {
//         interface Request {
//             user?: AuthPayload;
//         }
//     }
// }

// export { };

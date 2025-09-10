import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload;
        }
    }
}

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

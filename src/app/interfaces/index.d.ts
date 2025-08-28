import { JwtPayload } from "jsonwebtoken";
import { Role } from "../modules/user/user.interface";

export interface AuthPayload extends JwtPayload {
    _id: string,
    role: Role;
}

declare global {
    namespace express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export { };
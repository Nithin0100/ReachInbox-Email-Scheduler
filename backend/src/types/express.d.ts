import { User as AppUser } from "../models/user.model";

declare global {
    namespace Express {
        interface User extends AppUser {}
    }
}

export {};

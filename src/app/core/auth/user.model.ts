import { EUserRole } from "./user.enum";

export interface User {
    id: number;
    email: string;
    name: string;
    passwordHash: string;
    role: EUserRole;
    isActive: boolean;
    refreshTokenHash: string | null;
    createdAt: Date;
    updatedAt: Date;
}

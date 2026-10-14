import { EUserRole } from '../enums/user.enum';
import { User } from './User';

export type UserResponse = Omit<User, 'passwordHash' | 'refreshTokenHash' | 'updatedAt'>;

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: EUserRole;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    role?: EUserRole;
}

export interface UpdateUserStatusDto {
    isActive: boolean;
}

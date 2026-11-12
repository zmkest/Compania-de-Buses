import { EUserRole } from '../../../core/auth/user.enum';
import { User } from '../../../core/auth/user.model';

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

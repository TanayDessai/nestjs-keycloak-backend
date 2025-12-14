import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(registerUserDto: RegisterUserDto): Promise<{
        message: string;
        user: {
            id: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    }>;
    getProfile(req: any): Promise<{
        message: string;
        user: {
            id: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            roles: string[];
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
        user: {
            id: string;
            keycloakId: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            roles: string[];
            isActive: boolean;
        };
    }>;
    findAll(): Promise<{
        message: string;
        users: {
            id: string;
            keycloakId: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            roles: string[];
            isActive: boolean;
            createdAt: Date;
        }[];
    }>;
    findOne(id: string): Promise<{
        message: string;
        user: {
            id: string;
            keycloakId: string;
            username: string;
            email: string;
            firstName: string;
            lastName: string;
            roles: string[];
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

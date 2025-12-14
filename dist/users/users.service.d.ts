import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { KeycloakService } from '../keycloak/keycloak.service';
export declare class UsersService {
    private readonly usersRepository;
    private readonly keycloakService;
    constructor(usersRepository: Repository<User>, keycloakService: KeycloakService);
    register(registerUserDto: RegisterUserDto): Promise<User>;
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findByUsername(username: string): Promise<User>;
    findByKeycloakId(keycloakId: string): Promise<User>;
    remove(id: string): Promise<void>;
    updateActiveStatus(id: string, isActive: boolean): Promise<User>;
}

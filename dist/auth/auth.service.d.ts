import { KeycloakService } from '../keycloak/keycloak.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';
export declare class AuthService {
    private readonly keycloakService;
    private readonly usersService;
    constructor(keycloakService: KeycloakService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        access_token: any;
        refresh_token: any;
        expires_in: any;
        user: {
            id: any;
            keycloakId: any;
            username: any;
            email: any;
            firstName: any;
            lastName: any;
            roles: any;
        };
    }>;
    logout(refreshToken: string): Promise<void>;
    verifyToken(token: string): Promise<any>;
}

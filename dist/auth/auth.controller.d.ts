import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
        message: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    verify(req: any): Promise<{
        message: string;
        user: any;
    }>;
}

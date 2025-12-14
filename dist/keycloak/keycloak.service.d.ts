import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
export declare class KeycloakService {
    private readonly configService;
    private readonly httpService;
    private readonly keycloakBaseUrl;
    private readonly realm;
    private readonly clientId;
    private readonly clientSecret;
    private readonly adminUsername;
    private readonly adminPassword;
    constructor(configService: ConfigService, httpService: HttpService);
    getAdminToken(): Promise<string>;
    createUser(userData: {
        username: string;
        email: string;
        firstName?: string;
        lastName?: string;
        password: string;
        enabled?: boolean;
    }): Promise<string>;
    login(username: string, password: string): Promise<any>;
    logout(refreshToken: string): Promise<void>;
    deleteUser(keycloakUserId: string): Promise<void>;
    getUser(keycloakUserId: string): Promise<any>;
    verifyToken(token: string): Promise<any>;
}

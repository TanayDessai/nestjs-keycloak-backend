"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let KeycloakService = class KeycloakService {
    configService;
    httpService;
    keycloakBaseUrl;
    realm;
    clientId;
    clientSecret;
    adminUsername;
    adminPassword;
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.keycloakBaseUrl = this.configService.get('KEYCLOAK_BASE_URL') || 'http://localhost:8080';
        this.realm = this.configService.get('KEYCLOAK_REALM') || 'master';
        this.clientId = this.configService.get('KEYCLOAK_CLIENT_ID') || 'admin-cli';
        this.clientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET') || '';
        this.adminUsername = this.configService.get('KEYCLOAK_ADMIN_USERNAME') || 'admin';
        this.adminPassword = this.configService.get('KEYCLOAK_ADMIN_PASSWORD') || 'admin';
    }
    async getAdminToken() {
        try {
            const tokenUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
            const params = new URLSearchParams();
            params.append('client_id', this.clientId);
            params.append('username', this.adminUsername);
            params.append('password', this.adminPassword);
            params.append('grant_type', 'password');
            if (this.clientSecret) {
                params.append('client_secret', this.clientSecret);
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(tokenUrl, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            return response.data.access_token;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get admin token from Keycloak: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createUser(userData) {
        try {
            const token = await this.getAdminToken();
            const createUserUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users`;
            const keycloakUser = {
                username: userData.username,
                email: userData.email,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                enabled: userData.enabled !== false,
                emailVerified: true,
                credentials: [
                    {
                        type: 'password',
                        value: userData.password,
                        temporary: false,
                    },
                ],
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(createUserUrl, keycloakUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }));
            const locationHeader = response.headers.location;
            const userId = locationHeader.split('/').pop();
            return userId;
        }
        catch (error) {
            if (error.response?.status === 409) {
                throw new common_1.HttpException('User already exists in Keycloak', common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException(`Failed to create user in Keycloak: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(username, password) {
        try {
            const tokenUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
            const params = new URLSearchParams();
            params.append('client_id', this.clientId);
            params.append('username', username);
            params.append('password', password);
            params.append('grant_type', 'password');
            if (this.clientSecret) {
                params.append('client_secret', this.clientSecret);
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(tokenUrl, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED);
            }
            throw new common_1.HttpException(`Login failed: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async logout(refreshToken) {
        try {
            const logoutUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
            const params = new URLSearchParams();
            params.append('client_id', this.clientId);
            params.append('refresh_token', refreshToken);
            if (this.clientSecret) {
                params.append('client_secret', this.clientSecret);
            }
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(logoutUrl, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
        }
        catch (error) {
            throw new common_1.HttpException(`Logout failed: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteUser(keycloakUserId) {
        try {
            const token = await this.getAdminToken();
            const deleteUserUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${keycloakUserId}`;
            await (0, rxjs_1.firstValueFrom)(this.httpService.delete(deleteUserUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }));
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to delete user from Keycloak: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUser(keycloakUserId) {
        try {
            const token = await this.getAdminToken();
            const getUserUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${keycloakUserId}`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(getUserUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }));
            return response.data;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to get user from Keycloak: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyToken(token) {
        try {
            const introspectUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`;
            const params = new URLSearchParams();
            params.append('client_id', this.clientId);
            params.append('token', token);
            if (this.clientSecret) {
                params.append('client_secret', this.clientSecret);
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(introspectUrl, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            return response.data;
        }
        catch (error) {
            throw new common_1.HttpException(`Token verification failed: ${error.message || 'Unknown error'}`, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
};
exports.KeycloakService = KeycloakService;
exports.KeycloakService = KeycloakService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], KeycloakService);
//# sourceMappingURL=keycloak.service.js.map
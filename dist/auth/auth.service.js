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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const keycloak_service_1 = require("../keycloak/keycloak.service");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    keycloakService;
    usersService;
    constructor(keycloakService, usersService) {
        this.keycloakService = keycloakService;
        this.usersService = usersService;
    }
    async login(loginDto) {
        try {
            const tokens = await this.keycloakService.login(loginDto.username, loginDto.password);
            let user;
            try {
                user = await this.usersService.findByUsername(loginDto.username);
            }
            catch (error) {
                throw new common_1.HttpException(`User not found in database: ${error.message || 'Unknown error'}`, common_1.HttpStatus.NOT_FOUND);
            }
            return {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_in: tokens.expires_in,
                user: {
                    id: user.id,
                    keycloakId: user.keycloakId,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: user.roles,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Login failed: ${error.message || 'Unknown error'}`, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async logout(refreshToken) {
        try {
            await this.keycloakService.logout(refreshToken);
        }
        catch (error) {
            throw new common_1.HttpException(`Logout failed: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyToken(token) {
        return this.keycloakService.verifyToken(token);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [keycloak_service_1.KeycloakService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
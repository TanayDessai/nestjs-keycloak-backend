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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const keycloak_service_1 = require("../keycloak/keycloak.service");
let UsersService = class UsersService {
    usersRepository;
    keycloakService;
    constructor(usersRepository, keycloakService) {
        this.usersRepository = usersRepository;
        this.keycloakService = keycloakService;
    }
    async register(registerUserDto) {
        try {
            const keycloakUserId = await this.keycloakService.createUser({
                username: registerUserDto.username,
                email: registerUserDto.email,
                firstName: registerUserDto.firstName,
                lastName: registerUserDto.lastName,
                password: registerUserDto.password,
                enabled: true,
            });
            const user = this.usersRepository.create({
                keycloakId: keycloakUserId,
                email: registerUserDto.email,
                username: registerUserDto.username,
                firstName: registerUserDto.firstName,
                lastName: registerUserDto.lastName,
                roles: ['user'],
                isActive: true,
            });
            const savedUser = await this.usersRepository.save(user);
            return savedUser;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to register user: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async create(createUserDto) {
        try {
            const keycloakUserId = await this.keycloakService.createUser({
                username: createUserDto.username,
                email: createUserDto.email,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                password: createUserDto.password,
                enabled: true,
            });
            const user = this.usersRepository.create({
                keycloakId: keycloakUserId,
                email: createUserDto.email,
                username: createUserDto.username,
                firstName: createUserDto.firstName,
                lastName: createUserDto.lastName,
                roles: createUserDto.roles || ['user'],
                isActive: true,
            });
            const savedUser = await this.usersRepository.save(user);
            return savedUser;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to create user: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll() {
        return this.usersRepository.find();
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }
    async findByUsername(username) {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (!user) {
            throw new common_1.NotFoundException(`User with username ${username} not found`);
        }
        return user;
    }
    async findByKeycloakId(keycloakId) {
        const user = await this.usersRepository.findOne({ where: { keycloakId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with Keycloak ID ${keycloakId} not found`);
        }
        return user;
    }
    async remove(id) {
        const user = await this.findOne(id);
        try {
            await this.keycloakService.deleteUser(user.keycloakId);
            await this.usersRepository.remove(user);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to delete user: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateActiveStatus(id, isActive) {
        const user = await this.findOne(id);
        user.isActive = isActive;
        return this.usersRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        keycloak_service_1.KeycloakService])
], UsersService);
//# sourceMappingURL=users.service.js.map
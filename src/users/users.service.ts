import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { KeycloakService } from '../keycloak/keycloak.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly keycloakService: KeycloakService,
  ) {}

  /**
   * Register a new user (public self-registration)
   */
  async register(registerUserDto: RegisterUserDto): Promise<User> {
    try {
      // First, create user in Keycloak
      const keycloakUserId = await this.keycloakService.createUser({
        username: registerUserDto.username,
        email: registerUserDto.email,
        firstName: registerUserDto.firstName,
        lastName: registerUserDto.lastName,
        password: registerUserDto.password,
        enabled: true,
      });

      // Then, create user in PostgreSQL with default 'user' role
      const user = this.usersRepository.create({
        keycloakId: keycloakUserId,
        email: registerUserDto.email,
        username: registerUserDto.username,
        firstName: registerUserDto.firstName,
        lastName: registerUserDto.lastName,
        roles: ['user'], // Default role for self-registered users
        isActive: true,
      });

      const savedUser = await this.usersRepository.save(user);
      return savedUser;
    } catch (error: any) {
      // If Keycloak creation fails, throw the error
      if (error instanceof HttpException) {
        throw error;
      }
      
      // If PostgreSQL creation fails after Keycloak success, we should ideally rollback
      throw new HttpException(
        `Failed to register user: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new user in both Keycloak and PostgreSQL (Admin only)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // First, create user in Keycloak
      const keycloakUserId = await this.keycloakService.createUser({
        username: createUserDto.username,
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        password: createUserDto.password,
        enabled: true,
      });

      // Then, create user in PostgreSQL
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
    } catch (error) {
      // If Keycloak creation fails, throw the error
      if (error instanceof HttpException) {
        throw error;
      }
      
      // If PostgreSQL creation fails after Keycloak success, we should ideally rollback
      throw new HttpException(
        `Failed to create user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find all users from PostgreSQL
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * Find user by ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  /**
   * Find user by Keycloak ID
   */
  async findByKeycloakId(keycloakId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { keycloakId } });
    if (!user) {
      throw new NotFoundException(`User with Keycloak ID ${keycloakId} not found`);
    }
    return user;
  }

  /**
   * Delete user from both Keycloak and PostgreSQL
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    
    try {
      // First, delete from Keycloak
      await this.keycloakService.deleteUser(user.keycloakId);
      
      // Then, delete from PostgreSQL
      await this.usersRepository.remove(user);
    } catch (error) {
      throw new HttpException(
        `Failed to delete user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update user active status
   */
  async updateActiveStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = isActive;
    return this.usersRepository.save(user);
  }
}

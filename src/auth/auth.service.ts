import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { KeycloakService } from '../keycloak/keycloak.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Login user and return tokens
   */
  async login(loginDto: LoginDto) {
    try {
      // Authenticate with Keycloak
      const tokens = await this.keycloakService.login(
        loginDto.username,
        loginDto.password,
      );

      // Find user in PostgreSQL
      let user;
      try {
        user = await this.usersService.findByUsername(loginDto.username);
      } catch (error: any) {
        // User might not exist in PostgreSQL yet
        throw new HttpException(
          `User not found in database: ${error.message || 'Unknown error'}`,
          HttpStatus.NOT_FOUND,
        );
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
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Login failed: ${error.message || 'Unknown error'}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await this.keycloakService.logout(refreshToken);
    } catch (error: any) {
      throw new HttpException(
        `Logout failed: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(token: string): Promise<any> {
    return this.keycloakService.verifyToken(token);
  }
}

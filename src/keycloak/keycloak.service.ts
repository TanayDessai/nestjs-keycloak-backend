import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KeycloakService {
  private readonly keycloakBaseUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly adminUsername: string;
  private readonly adminPassword: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.keycloakBaseUrl = this.configService.get<string>('KEYCLOAK_BASE_URL') || 'http://localhost:8080';
    this.realm = this.configService.get<string>('KEYCLOAK_REALM') || 'master';
    this.clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID') || 'admin-cli';
    this.clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET') || '';
    this.adminUsername = this.configService.get<string>('KEYCLOAK_ADMIN_USERNAME') || 'admin';
    this.adminPassword = this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD') || 'admin';
  }

  /**
   * Get admin access token for Keycloak API calls
   */
  async getAdminToken(): Promise<string> {
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

      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      return response.data.access_token;
    } catch (error: any) {
      throw new HttpException(
        `Failed to get admin token from Keycloak: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new user in Keycloak
   */
  async createUser(userData: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    enabled?: boolean;
  }): Promise<string> {
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

      const response = await firstValueFrom(
        this.httpService.post(createUserUrl, keycloakUser, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      // Extract user ID from Location header
      const locationHeader = response.headers.location;
      const userId = locationHeader.split('/').pop();

      return userId;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new HttpException(
          'User already exists in Keycloak',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        `Failed to create user in Keycloak: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Authenticate user and get token
   */
  async login(username: string, password: string): Promise<any> {
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

      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new HttpException(
          'Invalid credentials',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        `Login failed: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const logoutUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/logout`;
      
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('refresh_token', refreshToken);
      
      if (this.clientSecret) {
        params.append('client_secret', this.clientSecret);
      }

      await firstValueFrom(
        this.httpService.post(logoutUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );
    } catch (error: any) {
      throw new HttpException(
        `Logout failed: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete user from Keycloak
   */
  async deleteUser(keycloakUserId: string): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const deleteUserUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${keycloakUserId}`;

      await firstValueFrom(
        this.httpService.delete(deleteUserUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    } catch (error: any) {
      throw new HttpException(
        `Failed to delete user from Keycloak: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user details from Keycloak
   */
  async getUser(keycloakUserId: string): Promise<any> {
    try {
      const token = await this.getAdminToken();
      const getUserUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${keycloakUserId}`;

      const response = await firstValueFrom(
        this.httpService.get(getUserUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      throw new HttpException(
        `Failed to get user from Keycloak: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const introspectUrl = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token/introspect`;
      
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('token', token);
      
      if (this.clientSecret) {
        params.append('client_secret', this.clientSecret);
      }

      const response = await firstValueFrom(
        this.httpService.post(introspectUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      throw new HttpException(
        `Token verification failed: ${error.message || 'Unknown error'}`,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.usersService.register(registerUserDto);
    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req) {
    const user = await this.usersService.findByUsername(req.user.username);
    return {
      message: 'Profile retrieved successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    };
  }

  @Post()
  @Roles('superadmin', 'admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        keycloakId: user.keycloakId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isActive: user.isActive,
      },
    };
  }

  @Get()
  @Roles('superadmin', 'admin')
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      message: 'Users retrieved successfully',
      users: users.map(user => ({
        id: user.id,
        keycloakId: user.keycloakId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    };
  }

  @Get(':id')
  @Roles('superadmin', 'admin')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      message: 'User retrieved successfully',
      user: {
        id: user.id,
        keycloakId: user.keycloakId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Delete(':id')
  @Roles('superadmin', 'admin')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      message: 'User deleted successfully',
    };
  }
}

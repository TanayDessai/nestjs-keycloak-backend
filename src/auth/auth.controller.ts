import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/dto/login.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      message: 'Login successful',
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refresh_token') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return {
      message: 'Logout successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Request() req) {
    return {
      message: 'Token is valid',
      user: req.user,
    };
  }
}

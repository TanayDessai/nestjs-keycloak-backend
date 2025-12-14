import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '../../keycloak/keycloak.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly keycloakService: KeycloakService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    // Extract token from header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    try {
      // Verify token with Keycloak
      const tokenData = await this.keycloakService.verifyToken(token);
      
      if (!tokenData.active) {
        throw new UnauthorizedException('Token is not active');
      }

      return {
        userId: payload.sub,
        username: payload.preferred_username,
        email: payload.email,
        roles: payload.realm_access?.roles || [],
      };
    } catch (error: any) {
      throw new UnauthorizedException(`Invalid token: ${error.message || 'Unknown error'}`);
    }
  }
}

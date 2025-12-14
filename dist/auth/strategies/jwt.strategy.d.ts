import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '../../keycloak/keycloak.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly keycloakService;
    constructor(configService: ConfigService, keycloakService: KeycloakService);
    validate(req: any, payload: any): Promise<{
        userId: any;
        username: any;
        email: any;
        roles: any;
    }>;
}
export {};

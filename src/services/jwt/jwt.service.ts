import { Injectable, Logger } from "@nestjs/common"
import { JwtService as NestJwtService } from "@nestjs/jwt"
import { envConfig } from "@src/config"
import { UserEntity } from "@src/database"
@Injectable()
export class JwtService {
    private readonly logger = new Logger(JwtService.name)

    constructor(private readonly jwtService: NestJwtService) {}

    public async createAuthTokenPair(payload: UserLike): Promise<AuthTokenPair> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: envConfig().secrets.jwt.secret,
                expiresIn: envConfig().secrets.jwt.accessTokenExpiration,
            }),
            this.jwtService.signAsync(payload, {
                secret: envConfig().secrets.jwt.secret,
                expiresIn: envConfig().secrets.jwt.refreshTokenExpiration,
            }),
        ])
        return {
            accessToken,
            refreshToken,
        }
    }
}

export type UserLike = Partial<UserEntity> & { id: string };

export class AuthTokenPair {
    accessToken: string
    refreshToken: string
}

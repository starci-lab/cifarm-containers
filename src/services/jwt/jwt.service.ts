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

    public async verifyToken(token: string): Promise<UserLike | null> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: envConfig().secrets.jwt.secret,
            })
        } catch (ex) {
            this.logger.error(ex)
            return null
        }
    }

    public async decodeToken(token: string): Promise<UserLike | null> {
        try {
            return this.jwtService.decode(token) as UserLike
        } catch (ex) {
            this.logger.error(ex)
            return null
        }
    }
}

export type UserLike = Partial<UserEntity> & { id: string };

export class AuthTokenPair {
    accessToken: string
    refreshToken: string
}

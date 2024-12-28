import { Injectable, Logger } from "@nestjs/common"
import { JwtService as NestJwtService } from "@nestjs/jwt"
import { envConfig } from "@src/config"
import { UserEntity } from "@src/databases"

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
            this.jwtService.signAsync({
                ...payload,
                refresh: true,
            }, {
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

    public async getExpiredAt(token: string): Promise<Date> {
        try {
            const decodedToken = this.jwtService.decode(token) as { exp?: number }
    
            return new Date(decodedToken.exp * 1000)
        } catch (ex) {
            this.logger.error("Failed to get expiration time from token", ex.message)
            return null
        }
    }
}

export type UserLike = Partial<UserEntity> & { id: string, refresh?: boolean };

export class AuthTokenPair {
    accessToken: string
    refreshToken: string
}

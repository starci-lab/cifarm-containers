import { Injectable, Logger } from "@nestjs/common"
import { JwtService as NestJwtService } from "@nestjs/jwt"
import { envConfig } from "@src/env"
import { AuthCredentials, UserLike } from "./jwt.types"
import { v4 } from "uuid"
import ms, { StringValue } from "ms"
import { DateUtcService } from "@src/date"

@Injectable()
export class JwtService {
    private readonly logger = new Logger(JwtService.name)

    constructor(
        private readonly jwtService: NestJwtService,
        private readonly dateUtcService: DateUtcService
    ) {}

    public async generateAuthCredentials(payload: UserLike): Promise<AuthCredentials> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: envConfig().secrets.jwt.secret,
                expiresIn: envConfig().secrets.jwt.accessTokenExpiration
            }),
            v4()
        ])
        return {
            accessToken,
            refreshToken: {
                token: refreshToken,
                expiredAt: await this.getExpiredAt()
            }
        }
    }

    public async verifyToken(token: string): Promise<UserLike | null> {
        try {
            return await this.jwtService.verifyAsync(token, {
                secret: envConfig().secrets.jwt.secret
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

    private async getExpiredAt(): Promise<Date> {
        try {
            const expiresIn = envConfig().secrets.jwt.refreshTokenExpiration
            const expiresInMs = ms(expiresIn as StringValue)
            return this.dateUtcService.getDayjs().add(expiresInMs, "millisecond").toDate()
        } catch (ex) {
            this.logger.error("Failed to get expiration time from token", ex.message)
            return null
        }
    }
}

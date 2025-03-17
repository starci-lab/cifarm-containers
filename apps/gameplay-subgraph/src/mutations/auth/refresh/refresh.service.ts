import { Injectable, Logger } from "@nestjs/common"
import { JwtService } from "@src/jwt"
import { RefreshRequest, RefreshResponse } from "./refresh.dto"
import { DateUtcService } from "@src/date"
import { InjectMongoose, SessionSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GraphQLError } from "graphql"

@Injectable()
export class RefreshService {
    private readonly logger = new Logger(RefreshService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly jwtService: JwtService,
        private readonly dateUtcService: DateUtcService
    ) {}

    public async refresh({ refreshToken }: RefreshRequest): Promise<RefreshResponse> {
        const mongoSession = await this.connection.startSession()

        try {
        // Using `withTransaction` to handle the transaction automatically
            const result = await mongoSession.withTransaction(async () => {
            // Fetch the session with the provided refresh token
                const session = await this.connection
                    .model<SessionSchema>(SessionSchema.name)
                    .findOne({ refreshToken })
                    .session(mongoSession)

                if (!session) {
                    throw new GraphQLError("Session not found", {
                        extensions: {
                            code: "SESSION_NOT_FOUND"
                        }
                    })
                }

                const { expiredAt } = session

                // Check if the refresh token has expired
                if (this.dateUtcService.getDayjs().isAfter(expiredAt)) {
                    throw new GraphQLError("Refresh token is expired", {
                        extensions: {
                            code: "REFRESH_TOKEN_EXPIRED"
                        }
                    })
                }

                // Generate new access and refresh tokens
                const {
                    accessToken,
                    refreshToken: { token: newRefreshToken, expiredAt: newExpiredAt }
                } = await this.jwtService.generateAuthCredentials({
                    id: session.user.toString(),
                })

                // Create a new session with the new refresh token and expiration date
                await this.connection.model<SessionSchema>(SessionSchema.name).create(
                    [{
                        user: session.user,
                        refreshToken: newRefreshToken,
                        expiredAt: newExpiredAt
                    }],
                    { session: mongoSession }
                )

                return {
                    accessToken,
                    refreshToken: newRefreshToken
                }
            })
            return result // Return the result after the transaction
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

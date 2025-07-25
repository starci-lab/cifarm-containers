import { Injectable, Logger } from "@nestjs/common"
import { JwtService } from "@src/jwt"
import { RefreshRequest, RefreshResponse } from "./refresh.dto"
import { DateUtcService } from "@src/date"
import { InjectMongoose, SessionSchema, UserSchema } from "@src/databases"
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
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE SESSION
                 ************************************************************/
                // Fetch the session with the provided refresh token
                const sessionData = await this.connection
                    .model<SessionSchema>(SessionSchema.name)
                    .findOne({ refreshToken, isActive: true })
                    .session(session)

                if (!sessionData) {
                    throw new GraphQLError("Session not found", {
                        extensions: {
                            code: "SESSION_NOT_FOUND"
                        }
                    })
                }

                const { expiredAt } = sessionData

                // Check if the refresh token has expired
                if (this.dateUtcService.getDayjs().isAfter(expiredAt)) {
                    throw new GraphQLError("Refresh token is expired", {
                        extensions: {
                            code: "REFRESH_TOKEN_EXPIRED"
                        }
                    })
                }
                const user = await this.connection.model<UserSchema>(UserSchema.name).findById(sessionData.user)
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }
                /************************************************************
                 * GENERATE NEW TOKENS
                 ************************************************************/
                // Generate new access and refresh tokens
                const {
                    accessToken,
                    refreshToken: { token: newRefreshToken, expiredAt: newExpiredAt }
                } = await this.jwtService.generateAuthCredentials({
                    id: sessionData.user.toString(),
                    network: user.network
                })
                /************************************************************
                 * CREATE NEW SESSION
                 ************************************************************/
                // Create a new session with the new refresh token and expiration date
                await this.connection.model<SessionSchema>(SessionSchema.name).create(
                    [{
                        user: sessionData.user,
                        refreshToken: newRefreshToken,
                        expiredAt: newExpiredAt
                    }],
                    { session }
                )

                return {
                    accessToken,
                    refreshToken: newRefreshToken
                }
            })
            return {
                success: true,
                message: "Refresh token generated successfully",
                data: result
            } // Return the result after the transaction
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

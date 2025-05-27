import { Injectable, Logger } from "@nestjs/common"
import { LogoutRequest, LogoutResponse } from "./logout.dto"
import { InjectMongoose, SessionSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GraphQLError } from "graphql"

@Injectable()
export class LogoutService {
    private readonly logger = new Logger(LogoutService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    public async logout({ refreshToken }: LogoutRequest): Promise<LogoutResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            await mongoSession.withTransaction(async (session) => {
                // check if the refresh token is valid
                const _session = await this.connection
                    .model<SessionSchema>(SessionSchema.name)
                    .findOne({ refreshToken, isActive: true }).session(session)
                if (!_session) {
                    throw new GraphQLError("Invalid refresh token or already logged out", {
                        extensions: {
                            code: "INVALID_REFRESH_TOKEN",
                        },
                    })
                }
                // Remove the session with the provided refresh token
                await this.connection
                    .model<SessionSchema>(SessionSchema.name)
                    .updateOne({ refreshToken }, { $set: { isActive: false } })
                    .session(session)
            })
            return {
                success: true,
                message: "User logged out successfully",
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
} 
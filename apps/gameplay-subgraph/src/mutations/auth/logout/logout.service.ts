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

            console.log("refreshToken", refreshToken)
            // check if the refresh token is valid
            const session = await this.connection
                .model<SessionSchema>(SessionSchema.name)
                .findOne({ refreshToken })

            if (!session) {
                throw new GraphQLError("Invalid refresh token or already logged out")
            }

            await mongoSession.withTransaction(async (session) => {
                // Remove the session with the provided refresh token
                await this.connection
                    .model<SessionSchema>(SessionSchema.name)
                    .deleteOne({ refreshToken })
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
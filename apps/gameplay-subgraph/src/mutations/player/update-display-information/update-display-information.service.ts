import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import {
    UpdateDisplayInformationRequest,
    UpdateDisplayInformationResponse
} from "./update-display-information.dto"
import { UsernameService } from "@src/gameplay"

@Injectable()
export class UpdateDisplayInformationService {
    private readonly logger = new Logger(UpdateDisplayInformationService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly usernameService: UsernameService
    ) {}

    async updateDisplayInformation(
        { id: userId}: UserLike,
        { username, avatarUrl }: UpdateDisplayInformationRequest
    ): Promise<UpdateDisplayInformationResponse> {
        const mongoSession = await this.connection.startSession()
        let user: UserSchema | undefined
        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async (session) => {
                // Get the user data
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }
                /************************************************************
                 * CHECK ELIGIBILITY
                 ************************************************************/
                // Update the token balance for the user
                // check if username is already taken
                if (username && username !== user.username) {
                    const isUsernameTaken = await this.usernameService.isUsernameTaken({
                        username,
                        network: user.network
                    })
                    if (isUsernameTaken) {
                        throw new GraphQLError("Username already taken", {
                            extensions: {
                                code: "USERNAME_ALREADY_TAKEN"
                            }
                        })
                    }
                    // check if username is sanitized
                    if (!this.usernameService.isUsernameSanitized({ username })) {
                        throw new GraphQLError("Username is not sanitized", {
                            extensions: {
                                code: "USERNAME_NOT_SANITIZED"
                            }
                        })
                    }
                    user.username = username
                }
                if (avatarUrl && avatarUrl !== user.avatarUrl) {
                    user.avatarUrl = avatarUrl
                }
                await user.save({ session })

                /************************************************************
                 * UPDATE USER DATA
                 ************************************************************/
                // Update user with the new token balance and mark followXAwarded as true
                return {
                    success: true,
                    message: "Display information updated successfully"
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}

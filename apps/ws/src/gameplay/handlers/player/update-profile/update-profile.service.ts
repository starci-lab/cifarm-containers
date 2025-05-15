import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { SyncService } from "@src/gameplay"
import { UpdateProfileMessage } from "./update-profile.dto"
import { SyncedResponse } from "../../types"

@Injectable()
export class UpdateProfileService {
    private readonly logger = new Logger(UpdateProfileService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService
    ) {}

    async updateProfile(
        { id: userId }: UserLike,
        request: UpdateProfileMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()
        
        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get the user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                const userSnapshot = user.$clone()

                user.username = request.username
                user.avatarUrl = request.avatarUrl

                // Save the updated user data
                await user.save({ session })

                const updatedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                return {
                    user: updatedUser
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

import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { UpdateSettingsMessage } from "./update-settings.dto"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import { SyncedResponse } from "../../types"
import { SyncService } from "@src/gameplay"
@Injectable()
export class UpdateSettingsService {
    private readonly logger = new Logger(UpdateSettingsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService
    ) {}

    async updateSettings(
        { id: userId }: UserLike,
        { sound, ambient }: UpdateSettingsMessage
    ): Promise<SyncedResponse> {
        // synced variables
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId).session(session)
                const userSnapshot = user.$clone()

                user.sound = sound
                user.ambient = ambient
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
            await mongoSession.endSession()
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { UpdateSettingsMessage } from "./update-settings.dto"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import { SyncedResponse } from "../../types"
@Injectable()
export class UpdateSettingsService {
    private readonly logger = new Logger(UpdateSettingsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection
    ) {}

    async updateSettings(
        { id: userId }: UserLike,
        { sound, ambient }: UpdateSettingsMessage
    ): Promise<SyncedResponse> {
        // synced variables
        const mongoSession = await this.connection.startSession()
        try {
            console.log(userId, sound, ambient)
            // Using withTransaction to handle the transaction lifecycle
            await mongoSession.withTransaction(async (session) => {
                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    {
                        _id: userId,
                    },
                    {
                        sound,
                        ambient
                    }
                ).session(session)
            })
            return {}
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

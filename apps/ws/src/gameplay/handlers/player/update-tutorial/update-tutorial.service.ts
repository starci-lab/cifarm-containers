import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, TutorialSchema, TutorialStep, UserSchema } from "@src/databases"
import { UserLike } from "@src/jwt"
import { Connection } from "mongoose"
import { SyncedResponse } from "../../types"
import { SyncService } from "@src/gameplay"
import { UpdateTutorialMessage } from "./update-tutorial.dto"
@Injectable()
export class UpdateTutorialService {
    private readonly logger = new Logger(UpdateTutorialService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService
    ) {}

    async updateTutorial(
        { id: userId }: UserLike,
        { start, openShopModal, openInventoryModal, plant, openNeighborsModal, atNeighbor }: UpdateTutorialMessage
    ): Promise<SyncedResponse> {
        // synced variables
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const user = await this.connection.model<UserSchema>(UserSchema.name).findById(userId).session(session)
                const userSnapshot = user.$clone()

                if (!user.tutorial) {
                    user.tutorial = {
                        [TutorialStep.Start]: start,
                        [TutorialStep.OpenShopModal]: openShopModal,
                        [TutorialStep.OpenInventoryModal]: openInventoryModal,
                        [TutorialStep.Plant]: plant,
                        [TutorialStep.OpenNeighborsModal]: openNeighborsModal,
                        [TutorialStep.AtNeighbor]: atNeighbor
                    } as TutorialSchema
                } else {
                    if (start) {
                        user.tutorial[TutorialStep.Start] = start
                    }
                    if (openShopModal) {
                        user.tutorial[TutorialStep.OpenShopModal] = openShopModal
                    }
                    if (openInventoryModal) {
                        user.tutorial[TutorialStep.OpenInventoryModal] = openInventoryModal
                    }
                    if (plant) {
                        user.tutorial[TutorialStep.Plant] = plant
                    }
                    if (openNeighborsModal) {
                        user.tutorial[TutorialStep.OpenNeighborsModal] = openNeighborsModal
                    }
                    if (atNeighbor) {
                        user.tutorial[TutorialStep.AtNeighbor] = atNeighbor
                    }
                }

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

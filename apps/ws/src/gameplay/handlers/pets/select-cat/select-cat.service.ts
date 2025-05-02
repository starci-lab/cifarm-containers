import { Injectable, Logger } from "@nestjs/common"
import { 
    InjectMongoose, 
    PetType,
    PlacedItemSchema, 
    PlacedItemType,
    UserSchema
} from "@src/databases"
import { 
    SyncService,
    StaticService
} from "@src/gameplay"
import { SelectCatMessage } from "./select-cat.dto"
import { Connection, Types } from "mongoose"
import { UserLike } from "@src/jwt"
import { DeepPartial } from "@src/common"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class SelectCatService {
    private readonly logger = new Logger(SelectCatService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async selectCat(
        { id: userId }: UserLike,
        { placedItemPetId }: SelectCatMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let syncedUser: DeepPartial<UserSchema> | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM ANIMAL
                 ************************************************************/
                // Fetch placed item (pet)
                const placedItemPet = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemPetId)
                    .session(session)

                if (!placedItemPet) {
                    throw new WsException("Pet not found")
                }

                // Validate ownership
                if (placedItemPet.user.toString() !== userId) {
                    throw new WsException("Cannot select another user's pet")
                }

                // Validate is a dog
                const placedItemPetType = this.staticService.placedItemTypes.find(
                    placedItemType => placedItemType.id === placedItemPet.placedItemType.toString()
                )
                if (!placedItemPetType) {
                    throw new WsException("Pet type not found")
                }
                if (placedItemPetType.type !== PlacedItemType.Pet) {
                    throw new WsException("Pet is not a dog")
                }
                const pet = this.staticService.pets.find(
                    pet => pet.id === placedItemPetType.pet.toString()
                )
                if (!pet) {
                    throw new WsException("Pet not found")
                }
                if (pet.type !== PetType.Cat) {
                    throw new WsException("Pet is not a cat")
                }

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)
                if (!user) {
                    throw new WsException("User not found")
                }
    
                // Save user snapshot for sync later
                const userSnapshot = user.$clone()
                // update the user selected cat id
                // throw if previouse cat is the same
                if (user.selectedPlacedItemCatId?.toString() === placedItemPetId) {
                    throw new WsException("Cannot select the same cat")
                }
                user.selectedPlacedItemCatId = new Types.ObjectId(placedItemPetId)
                await user.save({ session })

                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot: userSnapshot,
                    userUpdated: user
                })

                return {
                    user: syncedUser,
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)

            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
} 
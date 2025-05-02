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
import { SelectDogMessage } from "./select-dog.dto"
import { Connection, Types } from "mongoose"
import { UserLike } from "@src/jwt"
import { DeepPartial } from "@src/common"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class SelectDogService {
    private readonly logger = new Logger(SelectDogService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async selectDog(
        { id: userId }: UserLike,
        { placedItemPetId }: SelectDogMessage
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
                if (pet.type !== PetType.Dog) {
                    throw new WsException("Pet is not a dog")
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
                // throw if previouse dog is the same   
                if (user.selectedPlacedItemDogId?.toString() === placedItemPetId) {
                    throw new WsException("Cannot select the same dog")
                }
                // update the user selected dog id
                user.selectedPlacedItemDogId = new Types.ObjectId(placedItemPetId)
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
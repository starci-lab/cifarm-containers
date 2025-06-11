import { Injectable, Logger } from "@nestjs/common"
import {
    BuildingKind,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    UserSchema
} from "@src/databases"
import {
    GoldBalanceService,
    StaticService,
    SyncService,
    PositionService,
    LimitService
} from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyPetMessage } from "./buy-pet.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { StopBuyingResponse } from "../../types"
import { BuyPetData } from "./types"

@Injectable()
export class BuyPetService {
    private readonly logger = new Logger(BuyPetService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly positionService: PositionService,
        private readonly limitService: LimitService
    ) {}

    async buyPet(
        { id: userId }: UserLike,
        { position, petId }: BuyPetMessage
    ): Promise<StopBuyingResponse<BuyPetData>> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionPayload: EmitActionPayload<BuyPetData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let stopBuying: boolean | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PET
                 ************************************************************/
                const pet = this.staticService.pets.find((pet) => pet.displayId === petId)
                if (!pet) {
                    throw new WsException("Pet not found")
                }

                if (!pet.availableInShop) {
                    throw new WsException("Pet not available in shop")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE BUILDING AND PLACED ITEM TYPES
                 ************************************************************/
                // Get building for the animal
                const building = this.staticService.buildings.find(
                    (building) => building.kind === BuildingKind.PetHouse
                )

                if (!building) {
                    throw new WsException("Building not found for this pet type")
                }

                // Find the placed item type for the animal
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Pet &&
                        placedItemType.pet &&
                        placedItemType.pet.toString() === pet.id.toString()
                )

                if (!placedItemType) {
                    throw new WsException("Placed item type not found for this pet")
                }

                // Find the placed item type for the building
                const placedItemBuildingType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Building &&
                        placedItemType.building &&
                        placedItemType.building.toString() === building.id.toString()
                )

                if (!placedItemBuildingType) {
                    throw new WsException("Building placed item type not found")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                // Save user snapshot
                const userSnapshot = user.$clone()

                // Check if the user has enough gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: pet.price
                })

                /************************************************************
                 * CHECK POSITION AVAILABILITY
                 ************************************************************/
                const occupiedPositions = await this.positionService.getOccupiedPositions({
                    connection: this.connection,
                    userId
                })
                this.positionService.checkPositionAvailable({
                    position,
                    placedItemType,
                    occupiedPositions
                })
                /************************************************************
                 * CHECK PET CAPACITY
                 ************************************************************/
                // Check if the user has the required building for this animal
                const petCount = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        placedItemType: placedItemType.id
                    })
                    .session(session)

                // Calculate max capacity based on buildings and their upgrades
                let maxCapacity = 0
                const placedItemsBuilding = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .find({
                        user: userId,
                        placedItemType: placedItemBuildingType.id
                    })
                    .session(session)

                // Calculate max capacity based on upgrades
                for (const placedItemBuilding of placedItemsBuilding) {
                    maxCapacity +=
                        building.upgrades[placedItemBuilding.buildingInfo.currentUpgrade - 1]
                            .capacity
                }

                // Ensure the user hasn't reached the max pet capacity
                if (petCount >= maxCapacity) {
                    throw new WsException("Max capacity reached")
                }

                /************************************************************
                 * UPDATE USER DATA AND PLACE PET
                 ************************************************************/
                // Deduct gold from user
                this.goldBalanceService.subtract({
                    user,
                    amount: pet.price
                })

                // Save updated user data
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                // Place the pet in the user's farm (at the specified position)
                const [placedItemPetRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: placedItemType.id,
                                petInfo: {}
                            }
                        ],
                        { session }
                    )

                syncedPlacedItemAction = {
                    id: placedItemPetRaw._id.toString(),
                    x: placedItemPetRaw.x,
                    y: placedItemPetRaw.y,
                    placedItemType: placedItemPetRaw.placedItemType
                }

                const createdSyncedPlacedItems = this.syncService.getCreatedSyncedPlacedItems({
                    placedItems: [placedItemPetRaw]
                })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare action message
                actionPayload = {
                    action: ActionName.BuyPet,
                    success: true,
                    placedItem: syncedPlacedItemAction,
                    userId,
                    data: {
                        petId: pet.id
                    }
                }

                const limitData = await this.limitService.getPetLimit({
                    pet,
                    user,
                    session
                })
                console.log("limitData", limitData)

                stopBuying = !limitData.selectedPlacedItemCountNotExceedLimit     || user.golds < pet.price

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    action: actionPayload,
                    stopBuying
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionPayload) {
                return {
                    action: actionPayload
                }
            }

            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}

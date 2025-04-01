import { Injectable, Logger } from "@nestjs/common"
import { 
    InjectMongoose, 
    PlacedItemSchema, 
    PlacedItemType, 
    UserSchema
} from "@src/databases"
import { GoldBalanceService, StaticService, SyncService, PositionService, LimitService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyAnimalMessage } from "./buy-animal.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus, createObjectId } from "@src/common"
import { EmitActionPayload, ActionName, BuyAnimalData } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { StopBuyingResponse } from "../../types"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly positionService: PositionService,
        private readonly limitService: LimitService 
    ) {}

    async buyAnimal(
        { id: userId }: UserLike,
        { position, animalId }: BuyAnimalMessage
    ): Promise<StopBuyingResponse<BuyAnimalData>> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionPayload: EmitActionPayload<BuyAnimalData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let stopBuying: boolean | undefined

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE ANIMAL
                 ************************************************************/
                const animal = this.staticService.animals.find(
                    (animal) => animal.displayId === animalId
                )
                if (!animal) {
                    throw new WsException("Animal not found")
                }

                if (!animal.availableInShop) {
                    throw new WsException("Animal not available in shop")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE BUILDING AND PLACED ITEM TYPES
                 ************************************************************/
                // Get building for the animal
                const building = this.staticService.buildings.find(
                    (building) => building.animalContainedType === animal.type
                )

                if (!building) {
                    throw new WsException("Building not found for this animal type")
                }

                // Find the placed item type for the animal
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Animal &&
                        placedItemType.animal &&
                        placedItemType.animal.toString() === animal.id.toString()
                )

                if (!placedItemType) {
                    throw new WsException("Placed item type not found for this animal")
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
                    required: animal.price
                })

                /************************************************************
                 * CHECK POSITION AVAILABILITY
                 ************************************************************/
                const occupiedPositions = await this.positionService.getOccupiedPositions({
                    connection: this.connection,
                    userId,
                })
                this.positionService.checkPositionAvailable({
                    position,
                    placedItemType,
                    occupiedPositions
                })

                /************************************************************
                 * CHECK ANIMAL CAPACITY
                 ************************************************************/
                // Check if the user has the required building for this animal
                const animalCount = await this.connection
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

                // Ensure the user hasn't reached the max animal capacity
                if (animalCount >= maxCapacity) {
                    throw new WsException("Max capacity reached")
                }

                /************************************************************
                 * UPDATE USER DATA AND PLACE ANIMAL
                 ************************************************************/
                // Deduct gold from user
                this.goldBalanceService.subtract({
                    user,
                    amount: animal.price
                })

                // Save updated user data
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                // Place the animal in the user's farm (at the specified position)
                const [placedItemAnimalRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: placedItemType.id,
                                animalInfo: {
                                    animal: createObjectId(animalId)
                                }
                            }
                        ],
                        { session }
                    )

                syncedPlacedItemAction = {
                    id: placedItemAnimalRaw._id.toString(),
                    x: placedItemAnimalRaw.x,
                    y: placedItemAnimalRaw.y,
                    placedItemType: placedItemAnimalRaw.placedItemType
                }

                const createdSyncedPlacedItems =
                    this.syncService.getCreatedSyncedPlacedItems({
                        placedItems: [placedItemAnimalRaw]
                    })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare action message
                actionPayload = {
                    action: ActionName.BuyAnimal,
                    success: true,
                    placedItem: syncedPlacedItemAction,
                    userId,
                    data: {
                        animalId: animal.id
                    }
                }

                const limitData = await this.limitService.getAnimalLimit({
                    animal,
                    userId,
                    session
                })
                
                stopBuying =
                    !limitData.selectedPlacedItemCountNotExceedLimit ||
                    user.golds < animal.price
            })

            return {
                user: syncedUser,
                placedItems: syncedPlacedItems,
                action: actionPayload,
                stopBuying
            }
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
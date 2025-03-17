import { Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    PlacedItemSchema,
    SupplyType,
    UserSchema
} from "@src/databases"
import { CoreService, EnergyService, InventoryService, LevelService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { UseFertilizerRequest } from "./use-fertilizer.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        private readonly coreService: CoreService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async useFertilizer(
        { id: userId }: UserLike,
        { inventorySupplyId, placedItemTileId }: UseFertilizerRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload | undefined
        
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY SUPPLY
                 ************************************************************/
                
                // Get inventory supply
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventorySupplyId)
                    .session(session)
                
                // Validate inventory exists
                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                // Get inventory type from static data
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => inventoryType.id.toString() === inventory.inventoryType.toString()
                )
                
                // Validate inventory type exists and is a supply
                if (!inventoryType || inventoryType.type !== InventoryType.Supply) {
                    throw new GraphQLError("Inventory type is not supply", {
                        extensions: {
                            code: "INVENTORY_TYPE_IS_NOT_SUPPLY"
                        }
                    })
                }

                // Get supply from static data
                const supply = this.staticService.supplies.find(
                    (supply) => supply.id.toString() === inventoryType.supply?.toString()
                )
                
                // Validate supply exists
                if (!supply) {
                    throw new GraphQLError("Supply not found from static data", {
                        extensions: {
                            code: "SUPPLY_NOT_FOUND_FROM_STATIC_DATA"
                        }
                    })
                }

                // Validate supply is a fertilizer
                if (supply.type !== SupplyType.Fertilizer) {
                    throw new GraphQLError("Supply is not fertilizer", {
                        extensions: {
                            code: "SUPPLY_IS_NOT_FERTILIZER"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM TILE
                 ************************************************************/
                
                // Get placed item tile
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)
                
                // Validate placed item tile exists
                if (!placedItemTile) {
                    throw new GraphQLError("Placed item tile not found", {
                        extensions: {
                            code: "PLACED_ITEM_TILE_NOT_FOUND"
                        }
                    })
                }

                // Validate ownership
                if (placedItemTile.user.toString() !== userId) {
                    throw new GraphQLError("Cannot use fertilizer on another user's tile", {
                        extensions: {
                            code: "CANNOT_USE_ON_OTHERS_TILE"
                        }
                    })
                }

                // Validate tile is planted
                if (!placedItemTile.seedGrowthInfo) {
                    throw new GraphQLError("Tile is not planted", {
                        extensions: {
                            code: "TILE_NOT_PLANTED"
                        }
                    })
                }

                // Validate tile is not fully matured
                if (placedItemTile.seedGrowthInfo.currentState === CropCurrentState.FullyMatured) {
                    throw new GraphQLError("Tile is fully matured", {
                        extensions: {
                            code: "TILE_FULLY_MATURED"
                        }
                    })
                }

                // Validate tile is not already fertilized
                if (placedItemTile.seedGrowthInfo.isFertilized) {
                    throw new GraphQLError("Tile is already fertilized", {
                        extensions: {
                            code: "TILE_ALREADY_FERTILIZED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                
                // Get activity data
                const { energyConsume, experiencesGain } = this.staticService.activities.useFertilizer

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)
                
                // Validate user exists
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                // Validate energy is sufficient
                this.energyService.checkSufficient({ 
                    current: user.energy, 
                    required: energyConsume 
                })

                /************************************************************
                 * DATA MODIFICATION
                 * Update all data after all validations are complete
                 ************************************************************/
                
                // Update user energy and experience
                this.energyService.substract({ user, quantity: energyConsume })
                this.levelService.addExperiences({ user, experiences: experiencesGain })

                // Remove fertilizer from inventory
                const { inventories } = await this.inventoryService.getRemoveParams({
                    connection: this.connection,
                    userId: user.id,
                    session,
                    inventoryType,
                    kind: inventory.kind
                })

                const { removedInventories, updatedInventories } = this.inventoryService.remove({
                    inventories,
                    quantity: 1,
                })

                // Save updated inventories
                for (const inventory of updatedInventories) {
                    await inventory.save({ session })
                }

                // Delete removed inventories
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteMany({
                        _id: { $in: removedInventories.map(inventory => inventory._id) }
                    })
                    .session(session)
                
                // Save user changes
                await user.save({ session })

                // Update placed item tile
                this.coreService.updatePlacedItemTileAfterUseFertilizer({
                    placedItemTile,
                    supply
                })
                await placedItemTile.save({ session })

                // Prepare action message
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.UseFertilizer,
                    success: true,
                    userId,
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ placedItemTileId }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)

            if (actionMessage) {
                actionMessage.success = false
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

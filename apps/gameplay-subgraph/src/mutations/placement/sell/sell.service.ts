import { ActionName, EmitActionPayload, SellData } from "@apps/io-gameplay"
import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { AnimalSchema, BUILDING_INFO, BuildingSchema, InjectMongoose, PlacedItemSchema, PlacedItemType, PlacedItemTypeSchema, TileSchema, UserSchema } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { SellRequest } from "./sell.dto"
import { UserLike } from "@src/jwt" 

@Injectable()
export class SellService {
    private readonly logger = new Logger(SellService.name)

    constructor(
        @InjectMongoose() 
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async sell(
        { id: userId }: UserLike,
        { placedItemId }: SellRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload<SellData> | undefined

        try {
            // Using `withTransaction` for automatic transaction handling
            await mongoSession.withTransaction(async () => {
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemId)
                    .populate(BUILDING_INFO)
                    .session(mongoSession)

                //check user id
                if (placedItem.user.toString() !== userId) {
                    throw new NotFoundException("User not match")
                }

                // If the placed item is not found, throw an error
                if (!placedItem) throw new NotFoundException("Placed item not found")

                //get placed item type
                const placedItemType = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findById(placedItem.placedItemType)
                    .session(mongoSession)

                //check sellable
                if (!placedItemType.sellable) {
                    throw new BadRequestException("Item not sellable")
                }

                //get sell price
                let sellPrice: number = 0

                switch (placedItemType.type) {
                case PlacedItemType.Building: {
                    const building = await this.connection
                        .model<BuildingSchema>(BuildingSchema.name)
                        .findById(placedItemType.building)
                        .session(mongoSession)

                    if (!building) {
                        throw new NotFoundException("Building not found")
                    }
                    const upgradeLevel = placedItem?.buildingInfo?.currentUpgrade ?? 1
                    const upgradePrice = building.upgrades?.find(upgrade => upgrade.upgradeLevel === upgradeLevel)?.sellPrice ?? 0
                    sellPrice = upgradePrice
                    break
                }
                case PlacedItemType.Tile: {
                    const tile = await this.connection
                        .model<TileSchema>(TileSchema.name)
                        .findById(placedItemType.tile)
                        .session(mongoSession)
                    if (!tile) {
                        throw new NotFoundException("Tile not found")
                    }
                    sellPrice = tile.sellPrice ?? 0
                    break
                }
                case PlacedItemType.Animal: {
                    const animal = await this.connection
                        .model<AnimalSchema>(AnimalSchema.name)
                        .findById(placedItemType.animal)
                        .session(mongoSession)
                    if (!animal) {
                        throw new NotFoundException("Animal not found")
                    }
                    sellPrice = animal.sellPrice ?? 0
                    break
                }
                }

                const user: UserSchema = await this.connection.model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)


                // Subtract gold
                const goldsChanged = this.goldBalanceService.add({
                    user: user,
                    amount: sellPrice
                })

                //update
                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged },
                    { session: mongoSession }
                )

                //remove
                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                    .deleteOne({ _id: placedItemId })
                    .session(mongoSession)

                actionMessage = {
                    placedItemId: placedItemId,
                    action: ActionName.Sell,
                    success: true,
                    userId,
                    data: {
                        quantity: sellPrice
                    }
                }

                return { quantity: sellPrice }
            })

            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId }) }]
                })
            ])

            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }
            
            throw error
        } finally {
            await mongoSession.endSession()  // End the session after the transaction
        }
    }
}

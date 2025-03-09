import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    AnimalSchema,
    BuildingSchema,
    InjectMongoose,
    PlacedItemSchema, PlacedItemType,
    PlacedItemTypeSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"
import { Producer } from "kafkajs"
import { ActionEmittedMessage, ActionName } from "@apps/io-gameplay"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async buyAnimal({ animalId, position, userId}: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        let actionMessage: ActionEmittedMessage | undefined
        try {
            const animal = await this.connection.model<AnimalSchema>(AnimalSchema.name)
                .findById(createObjectId(animalId))
                .session(mongoSession)

            if (!animal) throw new GrpcNotFoundException("Animal not found")
            if (!animal.availableInShop) throw new GrpcFailedPreconditionException("Animal not available in shop")

            //get buildingId basedOn animalId
            const building = await this.connection.model<BuildingSchema>(BuildingSchema.name)
                .findOne({ type: animal.type })
                .session(mongoSession)

            //placedItemType
            const placedItemBuildingType = await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                .findOne({
                    type: PlacedItemType.Building,
                    building: building.id
                })
                .session(mongoSession)

            const placedItemAnimalType = await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                .findOne({
                    type: PlacedItemType.Animal,
                    animal: animal.id
                })
                .session(mongoSession)

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            const totalCost = animal.price
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            const animalCount = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: userId,
                    placedItemType: placedItemAnimalType,
                })
            
            let maxCapacity = 0
            
            const placedItemsBuilding = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({
                    user: userId,
                    placedItemType: placedItemBuildingType
                })
                .session(mongoSession)
            
            // Count maxCapacity
            for (const placedItemBuilding of placedItemsBuilding) {
                maxCapacity += building.upgrades[placedItemBuilding.buildingInfo.currentUpgrade - 1].capacity
            }

            if (animalCount >= maxCapacity) {
                throw new GrpcFailedPreconditionException("Max capacity reached")
            }
            
            const goldsChanged = this.goldBalanceService.subtract({
                user: user,
                amount: totalCost
            })

            await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                { _id: user.id },
                { ...goldsChanged }
            )

            const placedItemTypeAnimal = await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                .findOne({ type: PlacedItemType.Animal,
                    animal: createObjectId(animalId) })
                .session(mongoSession)

            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
                user: userId,
                x: position.x,
                y: position.y,
                placedItemType: placedItemTypeAnimal,
                animalInfo: {
                    animal: createObjectId(animalId),
                }
            })
            await mongoSession.commitTransaction()      
            
            actionMessage = {
                action: ActionName.BuyAnimal,
                success: true,
                placedItemId: placedItemTypeAnimal.id,
            }
            this.kafkaProducer.send({
                topic: KafkaTopic.EmitAction,
                messages: [{ value: JSON.stringify(actionMessage) }]
            })
            this.kafkaProducer.send({
                topic: KafkaTopic.SyncPlacedItems,
                messages: [{ value: JSON.stringify({ userId }) }]
            })
            return {}
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

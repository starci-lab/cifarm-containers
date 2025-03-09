import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    BuildingSchema,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"
import { ActionEmittedMessage, ActionName } from "@apps/io-gameplay"
import { Producer } from "kafkajs"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        this.logger.debug(
            `Constructing building for user ${request.userId}, id: ${request.buildingId},
             position: (${request.position.x}, ${request.position.y})`
        )

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        let actionMessage: ActionEmittedMessage
        try {
            // Fetch building information
            const building = await this.connection.model<BuildingSchema>(BuildingSchema.name)
                .findById(createObjectId(request.buildingId))
                .session(mongoSession)

            if (!building) {
                throw new GrpcNotFoundException("Building not found")
            }

            if (!building.availableInShop) {
                throw new GrpcFailedPreconditionException("Building not available in shop")
            }
            // Calculate total cost
            const totalCost = building.price

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            // Subtract gold
            const goldsChanged = this.goldBalanceService.subtract({
                user: user,
                amount: totalCost
            })

            await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                { _id: user.id },
                { ...goldsChanged }
            )
            // Save the placed item in the database
            const placedItems = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create([{
                user: user.id,
                x: request.position.x,
                y: request.position.y,
                placedItemType: createObjectId(request.buildingId),
                buildingInfo: {}
            }], {
                session: mongoSession
            })
            await mongoSession.commitTransaction()
            actionMessage = {
                action: ActionName.BuyAnimal,
                placedItemId: placedItems[0]._id.toString(),
                success: true,
            }
            await this.kafkaProducer.send({
                topic: KafkaTopic.EmitAction,
                messages: [{ value: JSON.stringify(actionMessage) }]
            })
            await this.kafkaProducer.send({
                topic: KafkaTopic.SyncPlacedItems,
                messages: [{ value: JSON.stringify({ userId: user.id }) }]
            })
            return {}
        } catch (error) {
            this.logger.error(error)
            if (actionMessage) {
                await this.kafkaProducer.send({
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

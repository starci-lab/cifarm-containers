import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"
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

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async constructBuilding(request: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        this.logger.debug(
            `Constructing building for user ${request.userId}, id: ${request.buildingId},
             position: (${request.position.x}, ${request.position.y})`
        )

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

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

            try {
                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged }
                )

                console.log(`User ${user.id} after buying building ${building.id}`)

                // Save the placed item in the database
                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
                    user: user.id,
                    x: request.position.x,
                    y: request.position.y,
                    placedItemType: createObjectId(request.buildingId),
                    buildingInfo: {}
                })

                await mongoSession.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await mongoSession.abortTransaction()
                throw error
            }

            // Publish event
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: user.id
            })

            return {}
        } finally {
            await mongoSession.endSession()
        }
    }
}

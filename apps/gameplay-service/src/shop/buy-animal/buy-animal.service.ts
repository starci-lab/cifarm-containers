import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"
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

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async buyAnimal(request: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        this.logger.debug(
            `Starting animal purchase for user ${request.userId}, animal id: ${request.animalId}`
        )

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const animal = await this.connection.model<AnimalSchema>(AnimalSchema.name)
                .findById(createObjectId(request.animalId))
                .session(mongoSession)

            if (!animal) throw new GrpcNotFoundException("Animal not found")
            if (!animal.availableInShop) throw new GrpcFailedPreconditionException("Animal not available in shop")

            const placedItemBuilding = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(request.placedItemBuildingId)
                .session(mongoSession)

            if (!placedItemBuilding) throw new GrpcNotFoundException("Building not found")

            const placedItemType = await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                .findById(placedItemBuilding.placedItemType)
                .session(mongoSession)

            console.log("placedItemBuilding", placedItemBuilding)

            const building = await this.connection.model<BuildingSchema>(BuildingSchema.name)
                .findById(placedItemType.building)
                .session(mongoSession)

            if (building.type !== animal.type)
                throw new GrpcFailedPreconditionException("Building is not for this animal")

            const maxCapacity = building.upgrades[placedItemBuilding.buildingInfo.currentUpgrade].capacity
            const count = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({ parentId: placedItemBuilding.id })
                .session(mongoSession)

            if (count >= maxCapacity)
                throw new GrpcFailedPreconditionException("Building is full")

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            const totalCost = animal.price
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            try {
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
                        animal: createObjectId(request.animalId) })
                    .session(mongoSession)

                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
                    userId: request.userId,
                    x: request.position.x,
                    y: request.position.y,
                    placedItemType: placedItemTypeAnimal,
                    parentId: placedItemBuilding.id,
                    animalInfo: {}
                })

                await mongoSession.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await mongoSession.abortTransaction()
                throw error
            }

            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: user.id
            })
            
            return {}
        } finally {
            await mongoSession.endSession()
        }
    }
}

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
                .findById(request.userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            const totalCost = animal.price
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            const animalCount = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: request.userId,
                    placedItemType: placedItemAnimalType,
                })
            
            let maxCapacity = 0
            
            const placedItemsBuilding = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({
                    user: request.userId,
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
                    user: request.userId,
                    x: request.position.x,
                    y: request.position.y,
                    placedItemType: placedItemTypeAnimal,
                    animalInfo: {
                        animal: createObjectId(request.animalId),
                    }
                })

                await mongoSession.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await mongoSession.abortTransaction()
                throw error
            }

            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, {
                userId: user.id
            })
            
            return {}
        } finally {
            await mongoSession.endSession()
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { GrpcFailedPreconditionException } from "@src/common"
import { AnimalSchema, BuildingInfoSchema, BuildingSchema, InjectMongoose, PlacedItemSchema, PlacedItemType } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
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

        try {
            const animal = await this.connection.model<AnimalSchema>(AnimalSchema.name).findOne({
                id: request.animalId
            })

            if (!animal) {
                throw new GrpcNotFoundException("Animal not found")
            }

            if (!animal.availableInShop) {
                throw new GrpcFailedPreconditionException("Animal not available in shop")
            }

            const placedItemBuilding = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .findOne({
                    id: request.placedItemBuildingId,

                }).populate(BuildingInfoSchema.name)

            // const placedItemBuilding = await queryRunner.manager.findOne(PlacedItemEntity, {
            //     where: {
            //         id: request.placedItemBuildingId
            //     },
            //     relations: {
            //         buildingInfo: true,
            //         placedItemType: {
            //             building: {
            //                 upgrades: true
            //             }
            //         }
            //     }
            // })

            if (!placedItemBuilding) throw new GrpcNotFoundException("Building not found")

            if (!placedItemBuilding.placedItemTypeKey)
                throw new GrpcNotFoundException("Placed item type not found")

            //Check if placedItem is building
            if (placedItemBuilding.type != PlacedItemType.Building)
                throw new GrpcFailedPreconditionException("Placed item is not a building")

            //get building
            const building = await this.connection.model<BuildingSchema>(BuildingSchema.name).findOne({
                key: placedItemBuilding.placedItemTypeKey
            })

            //Check if building is same animal type
            if (building.type != animal.type)
                throw new GrpcFailedPreconditionException("Building is not for this animal")

            //Check if slot is occupied
            const maxCapacity =
                building.upgrades[
                    placedItemBuilding.buildingInfo.currentUpgrade
                ].capacity

            //Check occupancy
            const count = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).countDocuments({
                parentId: placedItemBuilding.id
            })
            if (count >= maxCapacity)
                throw new GrpcFailedPreconditionException("Building is full")

            //Find placedItemType
            const placedItemType = await queryRunner.manager.findOne(PlacedItemTypeEntity, {
                where: {
                    type: PlacedItemType.Animal,
                    animalId: request.animalId
                }
            })

            if (!placedItemType) throw new GrpcFailedPreconditionException("Animal type not found")

            const user: UserSchema = await queryRunner.manager.findOne(UserSchema, {
                where: { id: request.userId }
            })

            if (!user) throw new GrpcNotFoundException("User not found")

            const totalCost = animal.price

            //Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

            const placedItemAnimal: DeepPartial<PlacedItemEntity> = {
                userId: request.userId,
                animalInfo: {},
                x: request.position.x,
                y: request.position.y,
                placedItemTypeId: placedItemType.id,
                parentId: placedItemBuilding.id
            }

            // Subtract gold
            const goldsChanged = this.goldBalanceService.subtract({
                entity: user,
                amount: totalCost
            })

            // Start transaction
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.update(UserSchema, user.id, {
                    ...goldsChanged
                })

                await queryRunner.manager.save(PlacedItemEntity, [
                    placedItemAnimal,
                    placedItemBuilding
                ])

                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            // Publish event
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: user.id
            })
            
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

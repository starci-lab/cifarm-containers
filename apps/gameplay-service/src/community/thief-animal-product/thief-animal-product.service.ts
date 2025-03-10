import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer } from "@src/brokers"
import {
    InjectMongoose,
} from "@src/databases"
import {
    EnergyService,
    InventoryService,
    LevelService,
    ThiefService
} from "@src/gameplay"
import { ThiefAnimalProductRequest, ThiefAnimalProductResponse } from "./thief-animal-product.dto"
import { Connection } from "mongoose"
import { Producer } from "kafkajs"

@Injectable()
export class ThiefAnimalProductService {
    private readonly logger = new Logger(ThiefAnimalProductService.name)

    constructor(
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly theifService: ThiefService,
        private readonly inventoryService: InventoryService
    ) {}

    async thiefAnimalProduct(
        request: ThiefAnimalProductRequest
    ): Promise<ThiefAnimalProductResponse> {
        console.log(request)
        // if (request.userId === request.neighborUserId) {
        //     throw new GrpcInvalidArgumentException("Cannot thief from yourself")
        // }
        // const queryRunner = this.dataSource.createQueryRunner()
        // await queryRunner.connect()

        // try {
        //     // get placed item
        //     const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemSchema, {
        //         where: {
        //             userId: request.neighborUserId,
        //             id: request.placedItemAnimalId,
        //             placedItemType: {
        //                 type: PlacedItemType.Animal
        //             }
        //         },
        //         relations: {
        //             animalInfo: true,
        //             placedItemType: {
        //                 animal: true
        //             }
        //         }
        //     })

        //     if (!placedItemAnimal) {
        //         throw new GrpcNotFoundException("Animal not found")
        //     }

        //     if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Yield) {
        //         throw new GrpcFailedPreconditionException("Animal is not yielding")
        //     }

        //     if (
        //         placedItemAnimal.animalInfo.harvestQuantityRemaining ===
        //         placedItemAnimal.placedItemType.animal.minHarvestQuantity
        //     ) {
        //         throw new GrpcFailedPreconditionException("Animal's thief limit has been reached")
        //     }

        //     const { value: activitiesValue } = await queryRunner.manager.findOne(SystemEntity, {
        //         where: { id: SystemId.Activities }
        //     })
        //     const {
        //         thiefAnimalProduct: { energyConsume, experiencesGain }
        //     } = activitiesValue as Activities

        //     //get user
        //     const user = await queryRunner.manager.findOne(UserSchema, {
        //         where: { id: request.userId }
        //     })

        //     this.energyService.checkSufficient({
        //         current: user.energy,
        //         required: energyConsume
        //     })

        //     const { value } = await queryRunner.manager.findOne(SystemEntity, {
        //         where: { id: SystemId.AnimalRandomness }
        //     })
        //     const { thief2, thief3 } = value as AnimalRandomness
        //     const { value: computedQuantity } = this.theifService.compute({
        //         thief2,
        //         thief3
        //     })

        //     //get the actual quantity
        //     const actualQuantity = Math.min(
        //         computedQuantity,
        //         placedItemAnimal.animalInfo.harvestQuantityRemaining -
        //             placedItemAnimal.placedItemType.animal.minHarvestQuantity
        //     )

        //     // get inventories
        //     const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
        //         where: {
        //             type: InventoryType.Product,
        //             product: {
        //                 type: ProductType.Animal,
        //                 animalId: placedItemAnimal.placedItemType.animalId,
        //                 isQuality: placedItemAnimal.animalInfo.isQuality
        //             }
        //         }
        //     })

        //     const existingInventories = await queryRunner.manager.find(InventoryEntity, {
        //         where: {
        //             userId: request.userId,
        //             inventoryTypeId: inventoryType.id
        //         }
        //     })

        //     const updatedInventories = this.inventoryService.add({
        //         entities: existingInventories,
        //         userId: request.userId,
        //         data: {
        //             inventoryType,
        //             quantity: actualQuantity
        //         }
        //     })

        //     // substract energy
        //     const energyChanges = this.energyService.substract({
        //         entity: user,
        //         energy: energyConsume
        //     })

        //     const experiencesChanges = this.levelService.addExperiences({
        //         entity: user,
        //         experiences: experiencesGain
        //     })

        //     await queryRunner.startTransaction()
        //     try {
        //         // update user
        //         await queryRunner.manager.update(UserSchema, user.id, {
        //             ...energyChanges,
        //             ...experiencesChanges
        //         })

        //         // update inventories
        //         await queryRunner.manager.save(InventoryEntity, updatedInventories)

        //         // update animal growth info
        //         await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
        //             harvestQuantityRemaining:
        //                 placedItemAnimal.animalInfo.harvestQuantityRemaining - actualQuantity
        //         })
        //         await queryRunner.commitTransaction()
        //     } catch (error) {
        //         const errorMessage = `Transaction failed, reason: ${error.message}`
        //         this.logger.error(errorMessage)
        //         await queryRunner.rollbackTransaction()
        //         throw new GrpcInternalException(errorMessage)
        //     }

        //     this.clientKafka.emit(KafkaPattern.SyncPlacedItems, {
        //         userId: request.neighborUserId
        //     })

        //     return {
        //         quantity: actualQuantity
        //     }
        // } finally {
        //     await queryRunner.release()
        // }
        return { quantity: 0 }
    }
}

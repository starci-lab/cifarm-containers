import { Injectable, Logger } from "@nestjs/common"
import { FeedAnimalRequest, FeedAnimalResponse } from "./feed-animal.dto"

@Injectable()
export class FeedAnimalService {
    private readonly logger = new Logger(FeedAnimalService.name)

    constructor(
        // @InjectPostgreSQL()
        // private readonly dataSource: DataSource,
        // private readonly energyService: EnergyService,
        // private readonly levelService: LevelService,
        // @InjectKafka()
        // private readonly clientKafka: ClientKafka
    ) {
    }

    async feedAnimal(request: FeedAnimalRequest): Promise<FeedAnimalResponse> {
        // const queryRunner = this.dataSource.createQueryRunner()
        // await queryRunner.connect()

        // try {
        //     const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemSchema, {
        //         where: {
        //             id: request.placedItemAnimalId,
        //             userId: request.userId,
        //             placedItemType: {
        //                 type: PlacedItemType.Animal
        //             }
        //         },
        //         relations: {
        //             animalInfo: true
        //         }
        //     })

        //     if (!placedItemAnimal)
        //         throw new GrpcNotFoundException("Animal not found")

        //     if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Hungry)
        //         throw new GrpcFailedPreconditionException("Animal is not hungry")

        //     const { value } = await queryRunner.manager.findOne(SystemEntity, {
        //         where: { id: SystemId.Activities }
        //     })
        //     const {
        //         feedAnimal: { energyConsume, experiencesGain }
        //     } = value as Activities

        //     const user = await queryRunner.manager.findOne(UserSchema, {
        //         where: { id: request.userId }
        //     })

        //     this.energyService.checkSufficient({
        //         current: user.energy,
        //         required: energyConsume
        //     })

        //     // Subtract energy
        //     const energyChanges = this.energyService.substract({
        //         entity: user,
        //         energy: energyConsume
        //     })
        //     // Update user energy and experience
        //     const experiencesChanges = this.levelService.addExperiences({
        //         entity: user,
        //         experiences: experiencesGain
        //     })

        //     // Inventory
        //     const inventory = await queryRunner.manager.findOne(InventoryEntity, {
        //         where: {
        //             userId: user.id,
        //             // Inventory type is Supply
        //             inventoryType: {
        //                 type: InventoryType.Supply,
        //                 supplyId: SupplyId.AnimalFeed
        //             }
        //         },
        //         relations: {
        //             inventoryType: true
        //         }
        //     })

        //     if (!inventory) throw new GrpcNotFoundException("Inventory not found")

        //     if (inventory.inventoryType.type !== InventoryType.Supply)
        //         throw new GrpcFailedPreconditionException("Inventory type is not supply")

        //     await queryRunner.startTransaction()
        //     try {
        //         // Decrease inventory
        //         await queryRunner.manager.update(InventoryEntity, inventory.id, {
        //             quantity: inventory.quantity - 1
        //         })

        //         await queryRunner.manager.update(UserSchema, user.id, {
        //             ...energyChanges,
        //             ...experiencesChanges
        //         })

        //         // Update animal state
        //         await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
        //             currentState: AnimalCurrentState.Normal
        //         })

        //         await queryRunner.commitTransaction()
        //     } catch (error) {
        //         const errorMessage = `Transaction failed, reason: ${error.message}`
        //         this.logger.error(errorMessage)
        //         await queryRunner.rollbackTransaction()
        //         throw new GrpcInternalException(errorMessage)
        //     }

        //     // Publish event to Kafka
        //     this.clientKafka.emit(KafkaPattern.PlacedItems, {
        //         userId: user.id
        //     })
            
        //     return {}
        // } finally {
        //     await queryRunner.release()
        // }

        return {}
    }
}

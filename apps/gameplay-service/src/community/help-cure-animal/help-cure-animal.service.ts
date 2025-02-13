import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka } from "@src/brokers"
import { EnergyService, LevelService } from "@src/gameplay"
import { 
    HelpCureAnimalRequest,
    HelpCureAnimalResponse 
} from "./help-cure-animal.dto"
// import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
// import { GrpcFailedPreconditionException } from "@src/common"
import { InjectConnection } from "@nestjs/mongoose"
import { Connection } from "mongoose"

@Injectable()
export class HelpCureAnimalService {
    private readonly logger = new Logger(HelpCureAnimalService.name)

    constructor(
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
        @InjectConnection()
        private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async helpCureAnimal(
        request: HelpCureAnimalRequest
    ): Promise<HelpCureAnimalResponse> {
        console.log(request)
        // if (request.userId === request.neighborUserId) {
        //     throw new GrpcInvalidArgumentException("Cannot help cure yourself")
        // }

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
        //             placedItemType: true
        //         }
        //     })

        //     if (!placedItemAnimal) {
        //         throw new GrpcNotFoundException("Animal not found")
        //     }

        //     if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick) {
        //         throw new GrpcFailedPreconditionException("Animal is not sick")
        //     }

        //     const { value } = await queryRunner.manager.findOne(SystemEntity, {
        //         where: { id: SystemId.Activities }
        //     })
        //     const {
        //         helpCureAnimal: { energyConsume, experiencesGain }
        //     } = value as Activities

        //     //get user
        //     const user = await queryRunner.manager.findOne(UserSchema, {
        //         where: { id: request.userId }
        //     })

        //     this.energyService.checkSufficient({
        //         current: user.energy,
        //         required: energyConsume
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

        //         // update animal info
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

        //     this.clientKafka.emit(KafkaPattern.PlacedItems, {
        //         userId: request.neighborUserId
        //     })

        //     return {}
        // } finally {
        //     await queryRunner.release()
        // }
        return {}
    }
}

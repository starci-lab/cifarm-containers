import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalCurrentState,
    AnimalInfoEntity,
    InjectPostgreSQL,
    PlacedItemEntity,
    PlacedItemType,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { CureAnimalRequest, CureAnimalResponse } from "./cure-animal.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class CureAnimalService {
    private readonly logger = new Logger(CureAnimalService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async cureAnimal(request: CureAnimalRequest): Promise<CureAnimalResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    id: request.placedItemAnimalId,
                    userId: request.userId,
                    placedItemType: {
                        type: PlacedItemType.Animal
                    }
                },
                relations: {
                    animalInfo: true
                }
            })

            if (!placedItemAnimal || !placedItemAnimal.animalInfo)
                throw new GrpcNotFoundException("Animal not found")

            const { animalInfo } = placedItemAnimal
            if (animalInfo.currentState !== AnimalCurrentState.Sick)
                throw new GrpcFailedPreconditionException("Animal is not sick")

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                cureAnimal: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            // Subtract energy
            const energyChanges = this.energyService.substract({
                entity: user,
                energy: energyConsume
            })

            await queryRunner.startTransaction()
            try {
                // Update animal state
                await queryRunner.manager.update(AnimalInfoEntity, animalInfo.id, {
                    currentState: AnimalCurrentState.Normal
                })

                // Update user energy and experience
                const experiencesChanges = this.levelService.addExperiences({
                    entity: user,
                    experiences: experiencesGain
                })

                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                await queryRunner.commitTransaction()
                return {}
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
        } finally {
            await queryRunner.release()
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalCurrentState,
    AnimalInfoEntity,
    InjectPostgreSQL,
    PlacedItemEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import {
    CureAnimalTransactionFailedException,
    PlacedItemAnimalNotFoundException,
    PlacedItemAnimalNotSickException
} from "@src/exceptions"
import { EnergyService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { CureAnimalRequest, CureAnimalResponse } from "./cure-animal.dto"

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
                    userId: request.userId
                },
                relations: {
                    animalInfo: true
                }
            })

            if (!placedItemAnimal)
                throw new PlacedItemAnimalNotFoundException(request.placedItemAnimalId)

            if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Sick)
                throw new PlacedItemAnimalNotSickException(request.placedItemAnimalId)

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
                await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
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
                this.logger.error("Cure Animal transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new CureAnimalTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}

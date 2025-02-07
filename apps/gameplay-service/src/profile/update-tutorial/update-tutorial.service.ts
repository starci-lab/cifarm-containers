import { Injectable, Logger } from "@nestjs/common"
import {
    CacheQueryRunnerService,
    CropCurrentState,
    CropEntity,
    InjectPostgreSQL,
    SeedGrowthInfoEntity,
    TutorialStep,
    UserEntity,
    defaultCropId
} from "@src/databases"
import { DataSource, QueryRunner } from "typeorm"
import { GrpcInternalException } from "nestjs-grpc-exceptions"
import { UpdateTutorialRequest, UpdateTutorialResponse } from "./update-tutorial.dto"
import { GrpcFailedPreconditionException } from "@src/common"
import { TutorialService } from "@src/gameplay"

@Injectable()
export class UpdateTutorialService {
    private readonly logger = new Logger(UpdateTutorialService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService,
        private readonly tutorialService: TutorialService,
    ) {}

    async updateTutorial(request: UpdateTutorialRequest): Promise<UpdateTutorialResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Get user
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // check if last step is reached
            const lastStep = this.tutorialService.isLastStep(user.tutorialStep)
            if (lastStep) {
                throw new GrpcFailedPreconditionException("You have reached the last step of the tutorial")
            }
            const nextStep = user.tutorialStep + 1

            switch (nextStep) {
            case TutorialStep.StartWaterCropAtStage1: {
                await this.startWaterCropAtStage1({ queryRunner, user, nextStep })
                break
            }
            case TutorialStep.StartWaterCropAtStage2: {
                await this.startWaterCropAtStage2({ queryRunner, user, nextStep })
                break
            }
            case TutorialStep.StartToStage3: {
                await this.startToStage3({ queryRunner, user, nextStep })
                break
            }
            case TutorialStep.StartHarvestCrop: {
                await this.startHarvestCrop({ queryRunner, user, nextStep })
                break
            }
            default: {
                await queryRunner.startTransaction()
                try {
                    await this.moveToNextTutorialStep({
                        queryRunner,
                        user,
                        nextStep
                    })
                    await queryRunner.commitTransaction()
                } catch (error) {
                    const errorMessage = `Transaction failed, reason: ${error.message}`
                    this.logger.error(errorMessage)
                    await queryRunner.rollbackTransaction()
                    throw new GrpcInternalException(errorMessage)
                }
            }
            }

            return {}
        } finally {
            await queryRunner.release()
        }
    }

    // increment tutorial step
    private async moveToNextTutorialStep(
        {
            queryRunner,
            user,
            nextStep
        }: MoveToNextTutorialStepParams
    ): Promise<void> {
        await queryRunner.manager.update(UserEntity, user.id, {
            tutorialStep: nextStep
        })
    }
    
    // water crop at stage 1
    private async startWaterCropAtStage1({
        queryRunner,
        nextStep,
        user,
    }: StartWaterCropAtStage1Params): Promise<void> {
        if (nextStep != TutorialStep.StartWaterCropAtStage2) {
            throw new GrpcFailedPreconditionException(
                "You are not in the right state to water crop at stage 1"
            )
        }
        // check your tiles if you have 1 default crop planted
        const seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
            where: {
                currentStage: 0,
                placedItem: {
                    userId: user.id
                },
                cropId: defaultCropId
            }
        })
        if (seedGrowthInfos.length !== 2) {
            throw new GrpcFailedPreconditionException(
                "You need to plant 2 default crop to enter this step"
            )
        }

        // process in transaction
        await queryRunner.startTransaction()
        try {
            const needWatererSeedGrowthInfoId = seedGrowthInfos[0].id
            // update the crops to stage 1, which one of them needs watered
            for (const seedGrowthInfo of seedGrowthInfos) {
                await queryRunner.manager.update(SeedGrowthInfoEntity, seedGrowthInfo.id, {
                    currentStage: 1,
                    currentState:
                        needWatererSeedGrowthInfoId === seedGrowthInfo.id
                            ? CropCurrentState.NeedWater
                            : CropCurrentState.Normal
                })
            }
            await this.moveToNextTutorialStep({
                queryRunner,
                user,
                nextStep
            })
            await queryRunner.commitTransaction()
        } catch (error) {
            const errorMessage = `Transaction failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        }
    }

    // water crop at stage 2
    private async startWaterCropAtStage2({
        queryRunner,
        nextStep,
        user,
    }: StartWaterCropAtStage2Params) {
        if (nextStep != TutorialStep.StartWaterCropAtStage2) {
            throw new GrpcFailedPreconditionException(
                "You are not in the right state to water crop at stage 2"
            )
        }
        // check your tiles if you have 1 default crop planted
        const seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
            where: {
                currentStage: 1,
                placedItem: {
                    userId: user.id
                },
                cropId: defaultCropId
            }
        })
        if (seedGrowthInfos.length !== 2) {
            throw new GrpcFailedPreconditionException(
                "You need to plant 2 default crop to enter this step"
            )
        }

        // if some crops need watering, throw error
        const someNeedWater = seedGrowthInfos.some(
            (seedGrowthInfo) => seedGrowthInfo.currentState === CropCurrentState.NeedWater
        )
        if (!someNeedWater) {
            throw new GrpcFailedPreconditionException(
                "You need to water all the crops in stage 1 to enter this step"
            )
        }

        // process in transaction
        await queryRunner.startTransaction()
        try {
            const needWatererSeedGrowthInfoId = seedGrowthInfos[0].id
            // update the crops to stage 2, which one of them needs watered
            for (const seedGrowthInfo of seedGrowthInfos) {
                await queryRunner.manager.update(SeedGrowthInfoEntity, seedGrowthInfo.id, {
                    currentStage: 2,
                    currentState:
                        needWatererSeedGrowthInfoId === seedGrowthInfo.id
                            ? CropCurrentState.NeedWater
                            : CropCurrentState.Normal
                })
            }
            await this.moveToNextTutorialStep({
                nextStep,
                queryRunner,
                user
            })
            await queryRunner.commitTransaction()
        } catch (error) {
            const errorMessage = `Transaction failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        }
    }

    // to stage 3
    private async startToStage3({ queryRunner, nextStep, user }: StartToStage3Params) {
        if (nextStep != TutorialStep.StartToStage3) {
            throw new GrpcFailedPreconditionException(
                "You are not in the right state to water crop at stage 3"
            )
        }
        // check your tiles if you have 1 default crop planted
        const seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
            where: {
                currentStage: 2,
                placedItem: {
                    userId: user.id
                },
                cropId: defaultCropId
            }
        })
        if (seedGrowthInfos.length !== 2) {
            throw new GrpcFailedPreconditionException(
                "You need to plant 2 default crop to enter this step"
            )
        }
        // if some crops need watering, throw error
        const someNeedWater = seedGrowthInfos.some(
            (seedGrowthInfo) => seedGrowthInfo.currentState === CropCurrentState.NeedWater
        )
        if (!someNeedWater) {
            throw new GrpcFailedPreconditionException(
                "You need to water all the crops in stage 2 to enter this step"
            )
        }

        // process in transaction
        await queryRunner.startTransaction()
        try {
            const infestedSeedGrowthInfoId = seedGrowthInfos[0].id
            // update the crops to stage 3, which one of them needs watered
            for (const seedGrowthInfo of seedGrowthInfos) {
                await queryRunner.manager.update(SeedGrowthInfoEntity, seedGrowthInfo.id, {
                    currentStage: 3,
                    currentState:
                        infestedSeedGrowthInfoId === seedGrowthInfo.id
                            ? CropCurrentState.IsInfested
                            : CropCurrentState.IsWeedy
                })
            }
            await this.moveToNextTutorialStep({
                nextStep,
                queryRunner,
                user
            })
            await queryRunner.commitTransaction()
        } catch (error) {
            const errorMessage = `Transaction failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        }
    }

    // harvest crop
    private async startHarvestCrop({ queryRunner, nextStep, user }: StartHarvestCropParams) {
        if (nextStep != TutorialStep.StartHarvestCrop) {
            throw new GrpcFailedPreconditionException(
                "You are not in the right state to water crop at harvest"
            )
        }
        // check your tiles if you have 1 default crop planted
        const seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
            where: {
                currentStage: 3,
                placedItem: {
                    userId: user.id
                },
                cropId: defaultCropId
            }
        })
        if (seedGrowthInfos.length !== 2) {
            throw new GrpcFailedPreconditionException(
                "You need to plant 2 default crop to enter this step"
            )
        }

        const crop = await this.cacheQueryRunnerService.findOne(queryRunner, CropEntity, {
            where: {
                id: defaultCropId
            }
        })

        // process in transaction
        await queryRunner.startTransaction()
        try {
            // update the crops to fully matured
            for (const seedGrowthInfo of seedGrowthInfos) {
                await queryRunner.manager.update(SeedGrowthInfoEntity, seedGrowthInfo.id, {
                    currentStage: crop.growthStages - 1,
                    harvestQuantityRemaining: crop.maxHarvestQuantity,
                    currentState: CropCurrentState.FullyMatured
                })
            }
            await this.moveToNextTutorialStep({
                queryRunner,
                user,
                nextStep
            })
            await queryRunner.commitTransaction()
        } catch (error) {
            const errorMessage = `Transaction failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        }
    }
}

export interface MoveToNextTutorialStepParams {
    queryRunner: QueryRunner
    user: UserEntity
    nextStep: TutorialStep
}
export type StartWaterCropAtStage1Params = MoveToNextTutorialStepParams
export type StartWaterCropAtStage2Params = StartWaterCropAtStage1Params
export type StartWaterCropAtStage3Params = StartWaterCropAtStage1Params
export type StartToStage3Params = StartWaterCropAtStage1Params
export type StartHarvestCropParams = StartWaterCropAtStage1Params

import { Injectable, Logger } from "@nestjs/common"
import {
    CacheQueryRunnerService,
    CropCurrentState,
    CropEntity,
    InjectPostgreSQL,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    TutorialInfo,
    TutorialState,
    UserEntity
} from "@src/databases"
import { DataSource, QueryRunner } from "typeorm"
import { GrpcInternalException } from "nestjs-grpc-exceptions"
import { UpdateTutorialRequest, UpdateTutorialResponse } from "./update-tutorial.dto"
import { GrpcFailedPreconditionException } from "@src/common"
import { defaultCropId } from "@src/gameplay"

@Injectable()
export class UpdateTutorialService {
    private readonly logger = new Logger(UpdateTutorialService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly cacheQueryRunnerService: CacheQueryRunnerService
    ) {}

    async updateTutorial(request: UpdateTutorialRequest): Promise<UpdateTutorialResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Get latest user
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // get the system info, with cache
            const { value } = await this.cacheQueryRunnerService.findOne(
                queryRunner,
                SystemEntity,
                {
                    where: {
                        id: SystemId.TutorialInfo
                    }
                }
            )
            const { steps } = value as TutorialInfo

            const state = steps.find((step) => step.step === user.tutorialStep).state

            switch (state) {
            case TutorialState.WaterCropAtStage1: {
                await this.waterCropAtStage1({ queryRunner, user, state })
                break
            }
            case TutorialState.WaterCropAtStage2: {
                await this.waterCropAtStage2({ queryRunner, user, state })
                break
            }
            case TutorialState.ToStage3: {
                await this.toStage3({ queryRunner, user, state })
                break
            }
            case TutorialState.HarvestCrop: {
                await this.harvestCrop({ queryRunner, user, state })
                break
            }
            default: {
                await queryRunner.startTransaction()
                try {
                    await this.moveToNextTutorialStep(queryRunner, user.id)
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

    // water crop at stage 1
    private async waterCropAtStage1({
        queryRunner,
        state,
        user
    }: WaterCropAtStage1Params): Promise<void> {
        if (state != TutorialState.WaterCropAtStage1) {
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
            await this.moveToNextTutorialStep(queryRunner, user.id)
            await queryRunner.commitTransaction()
        } catch (error) {
            const errorMessage = `Transaction failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        }
    }

    // increment tutorial step
    private async moveToNextTutorialStep(queryRunner: QueryRunner, userId: string): Promise<void> {
        await queryRunner.manager.increment(UserEntity, { id: userId }, "tutorialStep", 1)
    }

    // water crop at stage 2
    private async waterCropAtStage2({ queryRunner, state, user }: WaterCropAtStage2Params) {
        if (state != TutorialState.WaterCropAtStage2) {
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
            await this.moveToNextTutorialStep(queryRunner, user.id)
            await queryRunner.commitTransaction()
        } catch (error) {
            const errorMessage = `Transaction failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        }
    }

    // to stage 3
    private async toStage3({ queryRunner, state, user }: ToStage3Params) {
        if (state != TutorialState.ToStage3) {
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
            await this.moveToNextTutorialStep(queryRunner, user.id)
            await queryRunner.commitTransaction()
        } catch (error) {
            const errorMessage = `Transaction failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        }
    }

    // harvest crop
    private async harvestCrop({ queryRunner, state, user }: HarvestCropParams) {
        if (state != TutorialState.UsePesticide) {
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
                cropId: defaultCropId,
            },
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
                    currentState: CropCurrentState.FullyMatured,
                })
            }
            await this.moveToNextTutorialStep(queryRunner, user.id)
            await queryRunner.commitTransaction()
        } catch (error) {
            const errorMessage = `Transaction failed, reason: ${error.message}`
            this.logger.error(errorMessage)
            await queryRunner.rollbackTransaction()
            throw new GrpcInternalException(errorMessage)
        }
    }
}

export interface WaterCropAtStage1Params {
    queryRunner: QueryRunner
    user: UserEntity
    state: TutorialState
}

export type WaterCropAtStage2Params = WaterCropAtStage1Params
export type WaterCropAtStage3Params = WaterCropAtStage1Params
export type ToStage3Params = WaterCropAtStage1Params
export type HarvestCropParams = WaterCropAtStage1Params

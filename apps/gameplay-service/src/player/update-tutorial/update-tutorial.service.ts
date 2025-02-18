import { Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    CropSchema,
    DefaultInfo,
    InjectMongoose,
    PlacedItemSchema,
    SystemId,
    SystemRecord,
    SystemSchema,
    TutorialStep,
    UserSchema
} from "@src/databases"
import { UpdateTutorialRequest, UpdateTutorialResponse } from "./update-tutorial.dto"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { TutorialService } from "@src/gameplay"
import { ClientSession, Connection } from "mongoose"

@Injectable()
export class UpdateTutorialService {
    private readonly logger = new Logger(UpdateTutorialService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tutorialService: TutorialService
    ) {}

    async updateTutorial(request: UpdateTutorialRequest): Promise<UpdateTutorialResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const { value: { defaultCropId } } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                .session(mongoSession)

            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)
            // check if last step is reached
            const lastStep = this.tutorialService.isLastStep(user.tutorialStep)
            if (lastStep) {
                throw new GrpcFailedPreconditionException(
                    "You have reached the last step of the tutorial"
                )
            }
            const nextStep = user.tutorialStep + 1

            switch (nextStep) {
            case TutorialStep.StartWaterCropAtStage1: {
                await this.startWaterCropAtStage1({ defaultCropId, mongoSession, user, nextStep })
                break
            }
            case TutorialStep.StartWaterCropAtStage2: {
                await this.startWaterCropAtStage2({ defaultCropId, mongoSession, user, nextStep })
                break
            }
            case TutorialStep.StartToStage3: {
                await this.startToStage3({ defaultCropId, mongoSession, user, nextStep })
                break
            }
            case TutorialStep.StartHarvestCrop: {
                await this.startHarvestCrop({ defaultCropId, mongoSession, user, nextStep })
                break
            }
            default: {
                await this.moveToNextTutorialStep({
                    defaultCropId,
                    mongoSession,
                    user,
                    nextStep
                })
            }
            }
            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }

    // increment tutorial step
    private async moveToNextTutorialStep({
        mongoSession,
        user,
        nextStep
    }: MoveToNextTutorialStepParams): Promise<void> {
        await this.connection
            .model<UserSchema>(UserSchema.name)
            .updateOne(
                { _id: user.id },
                {
                    tutorialStep: nextStep
                }
            )
            .session(mongoSession)
    }

    // water crop at stage 1
    private async startWaterCropAtStage1({
        mongoSession,
        nextStep,
        defaultCropId,
        user
    }: StartWaterCropAtStage1Params): Promise<void> {
        if (nextStep != TutorialStep.StartWaterCropAtStage1) {
            throw new GrpcFailedPreconditionException(
                "You are not in the right state to water crop at stage 1"
            )
        }
        // check your tiles if you have 1 default crop planted
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                user: user.id,
                "seedGrowthInfo.crop": createObjectId(defaultCropId)
            })
            .session(mongoSession)
        if (placedItems.length < 2) {
            throw new GrpcFailedPreconditionException(
                "You need to plant at least 2 default crop to enter this step"
            )
        }
        const needWateredSeedGrowthInfo = placedItems[0].seedGrowthInfo
        // update the crops to stage 1, which one of them needs watered
        for (const placedItem of placedItems) {
            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                { _id: placedItem.id },
                {
                    "seedGrowthInfo.currentStage": 1,
                    "seedGrowthInfo.currentState": placedItem.seedGrowthInfo.id === needWateredSeedGrowthInfo.id
                        ? CropCurrentState.NeedWater
                        : CropCurrentState.Normal
                }
            ).session(mongoSession)
        }
        await this.moveToNextTutorialStep({
            mongoSession,
            defaultCropId,
            user,
            nextStep
        })
    }

    // water crop at stage 2
    private async startWaterCropAtStage2({
        mongoSession,
        defaultCropId,
        nextStep,
        user
    }: StartWaterCropAtStage2Params) {
        if (nextStep != TutorialStep.StartWaterCropAtStage2) {
            throw new GrpcFailedPreconditionException(
                "You are not in the right state to water crop at stage 2"
            )
        }

        const placedItems = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
            user: user.id,
            "seedGrowthInfo.crop": createObjectId(defaultCropId)
        }).session(mongoSession)
        if (placedItems.length < 2) {
            throw new GrpcFailedPreconditionException(
                "You need to plant at least 2 default crop to enter this step"
            )
        }

        // if some crops need watering, throw error
        // const someNeedWater = seedGrowthInfos.some(
        //     (seedGrowthInfo) => seedGrowthInfo.currentState === CropCurrentState.NeedWater
        // )
        const someNeedWater = placedItems.some(
            (placedItem) => placedItem.seedGrowthInfo.currentState === CropCurrentState.NeedWater
        )
        if (someNeedWater) {
            throw new GrpcFailedPreconditionException(
                "You need to water all the crops in stage 1 to enter this step"
            )
        }

        const needWateredSeedGrowthInfo = placedItems[0].seedGrowthInfo
        for (const placedItem of placedItems) {
            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                { _id: placedItem.id },
                {
                    "seedGrowthInfo.currentStage": 2,
                    "seedGrowthInfo.currentState": placedItem.seedGrowthInfo.id === needWateredSeedGrowthInfo.id
                        ? CropCurrentState.NeedWater
                        : CropCurrentState.Normal
                }
            ).session(mongoSession)
        }
        await this.moveToNextTutorialStep({
            nextStep,
            mongoSession,
            defaultCropId,
            user
        })
    }

    // to stage 3
    private async startToStage3({ mongoSession, defaultCropId, nextStep, user }: StartToStage3Params) {
        if (nextStep != TutorialStep.StartToStage3) {
            throw new GrpcFailedPreconditionException(
                "You are not in the right state to water crop at stage 3"
            )
        }
        const placedItems = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
            user: user.id,
            "seedGrowthInfo.crop": createObjectId(defaultCropId)
        }).session(mongoSession)
        if (placedItems.length < 2) {
            throw new GrpcFailedPreconditionException(
                "You need to plant 2 default crop to enter this step"
            )
        }
        // if some crops need watering, throw error
        const someNeedWater = placedItems.some(
            (placedItem) => placedItem.seedGrowthInfo.currentState === CropCurrentState.NeedWater
        )
        if (someNeedWater) {
            throw new GrpcFailedPreconditionException(
                "You need to water all the crops in stage 2 to enter this step"
            )
        }
        const pesticideSeedGrowthInfo = placedItems[0].seedGrowthInfo
        for (const placedItem of placedItems) {
            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne(
                { _id: placedItem.id },
                {
                    "seedGrowthInfo.currentStage": 3,
                    "seedGrowthInfo.currentState": pesticideSeedGrowthInfo.id === placedItem.seedGrowthInfo.id ?
                        CropCurrentState.IsInfested : CropCurrentState.IsWeedy
                }
            ).session(mongoSession)
        }

        // process in transaction
        await this.moveToNextTutorialStep({
            nextStep,
            mongoSession,
            defaultCropId,
            user
        })
    }

    // harvest crop
    private async startHarvestCrop({ mongoSession, defaultCropId, nextStep, user }: StartHarvestCropParams) {
        if (nextStep != TutorialStep.StartHarvestCrop) {
            throw new GrpcFailedPreconditionException(
                "You are not in the right state to water crop at harvest"
            )
        }

        const placedItems = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
            user: user.id,
            "seedGrowthInfo.crop": createObjectId(defaultCropId)
        }).session(mongoSession)
 
        if (placedItems.length < 2) {
            throw new GrpcFailedPreconditionException(
                "You need to plant 2 default crop to enter this step"
            )
        }

        const crop = await this.connection.model<CropSchema>(CropSchema.name).findById(
            createObjectId(defaultCropId)
        ).session(mongoSession)

        await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateMany(
            {
                user: user.id,
                "seedGrowthInfo.crop": createObjectId(defaultCropId)
            },
            {
                "seedGrowthInfo.currentStage": crop.growthStages - 1,
                "seedGrowthInfo.harvestQuantityRemaining": crop.maxHarvestQuantity,
                "seedGrowthInfo.currentState": CropCurrentState.FullyMatured
            }
        ).session(mongoSession)

        await this.moveToNextTutorialStep({
            mongoSession,
            defaultCropId,
            user,
            nextStep
        })
    }
}

export interface MoveToNextTutorialStepParams {
    mongoSession: ClientSession
    user: UserSchema
    nextStep: TutorialStep
    defaultCropId: string
}

export type StartWaterCropAtStage1Params = MoveToNextTutorialStepParams
export type StartWaterCropAtStage2Params = StartWaterCropAtStage1Params
export type StartWaterCropAtStage3Params = StartWaterCropAtStage1Params
export type StartToStage3Params = StartWaterCropAtStage1Params
export type StartHarvestCropParams = StartWaterCropAtStage1Params

import { BadRequestException, Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    CropSchema,
    DefaultInfo,
    InjectMongoose,
    PlacedItemSchema,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    TutorialStep,
    UserSchema
} from "@src/databases"
import { createObjectId } from "@src/common"
import { TutorialService } from "@src/gameplay"
import { ClientSession, Connection } from "mongoose"
import { UserLike } from "@src/jwt"

@Injectable()
export class UpdateTutorialService {
    private readonly logger = new Logger(UpdateTutorialService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tutorialService: TutorialService
    ) {}

    async updateTutorial(
        { id: userId }: UserLike
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using `withTransaction` to handle the transaction automatically
            await mongoSession.withTransaction(async () => {
                const { value: { defaultCropId } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                    .session(mongoSession)

                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // Check if last step is reached
                const lastStep = this.tutorialService.isLastStep(user.tutorialStep)
                if (lastStep) {
                    throw new BadRequestException(
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
                }

                // Update the user with the next tutorial step
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: user.id },
                        {
                            tutorialStep: nextStep
                        }
                    )
                    .session(mongoSession)

                // No return value needed for void
            })

            // No return value needed for void
        } catch (error) {
            this.logger.error(error)
            throw error // Rethrow the error after logging
        } finally {
            await mongoSession.endSession() // Ensure the session is always ended
        }
    }

    // water crop at stage 1
    private async startWaterCropAtStage1({
        mongoSession,
        nextStep,
        defaultCropId,
        user
    }: StartWaterCropAtStage1Params): Promise<void> {
        if (nextStep != TutorialStep.StartWaterCropAtStage1) {
            throw new BadRequestException(
                "You are not in the right state to water crop at stage 1"
            )
        }
        // Check your tiles if you have 1 default crop planted
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                user: user.id,
                "seedGrowthInfo.crop": createObjectId(defaultCropId)
            })
            .session(mongoSession)

        if (placedItems.length < 2) {
            throw new BadRequestException(
                "You need to plant at least 2 default crop to enter this step"
            )
        }

        const needWateredSeedGrowthInfo = placedItems[0].seedGrowthInfo
        // Update the crops to stage 1, which one of them needs watered
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
    }

    // water crop at stage 2
    private async startWaterCropAtStage2({
        mongoSession,
        defaultCropId,
        nextStep,
        user
    }: StartWaterCropAtStage2Params): Promise<void> {
        if (nextStep != TutorialStep.StartWaterCropAtStage2) {
            throw new BadRequestException(
                "You are not in the right state to water crop at stage 2"
            )
        }

        const placedItems = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
            user: user.id,
            "seedGrowthInfo.crop": createObjectId(defaultCropId)
        }).session(mongoSession)

        if (placedItems.length < 2) {
            throw new BadRequestException(
                "You need to plant at least 2 default crop to enter this step"
            )
        }

        const someNeedWater = placedItems.some(
            (placedItem) => placedItem.seedGrowthInfo.currentState === CropCurrentState.NeedWater
        )

        if (someNeedWater) {
            throw new BadRequestException(
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
    }

    // to stage 3
    private async startToStage3({ mongoSession, defaultCropId, nextStep, user }: StartToStage3Params): Promise<void> {
        if (nextStep != TutorialStep.StartToStage3) {
            throw new BadRequestException(
                "You are not in the right state to water crop at stage 3"
            )
        }

        const placedItems = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
            user: user.id,
            "seedGrowthInfo.crop": createObjectId(defaultCropId)
        }).session(mongoSession)

        if (placedItems.length < 2) {
            throw new BadRequestException(
                "You need to plant 2 default crop to enter this step"
            )
        }

        const someNeedWater = placedItems.some(
            (placedItem) => placedItem.seedGrowthInfo.currentState === CropCurrentState.NeedWater
        )

        if (someNeedWater) {
            throw new BadRequestException(
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
    }

    // harvest crop
    private async startHarvestCrop({ mongoSession, defaultCropId, nextStep, user }: StartHarvestCropParams): Promise<void> {
        if (nextStep != TutorialStep.StartHarvestCrop) {
            throw new BadRequestException(
                "You are not in the right state to water crop at harvest"
            )
        }

        const placedItems = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).find({
            user: user.id,
            "seedGrowthInfo.crop": createObjectId(defaultCropId)
        }).session(mongoSession)

        if (placedItems.length < 2) {
            throw new BadRequestException(
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
    }
}

export interface StartWaterCropAtStage1Params {
    mongoSession: ClientSession
    user: UserSchema
    nextStep: TutorialStep
    defaultCropId: string
}
export type StartWaterCropAtStage2Params = StartWaterCropAtStage1Params
export type StartWaterCropAtStage3Params = StartWaterCropAtStage1Params
export type StartToStage3Params = StartWaterCropAtStage1Params
export type StartHarvestCropParams = StartWaterCropAtStage1Params

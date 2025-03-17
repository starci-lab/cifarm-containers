import { Injectable, Logger } from "@nestjs/common"
import {
    CropCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    TutorialStep,
    UserSchema
} from "@src/databases"
import { ClientSession, Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { TutorialService, StaticService } from "@src/gameplay"

@Injectable()
export class UpdateTutorialService {
    private readonly logger = new Logger(UpdateTutorialService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tutorialService: TutorialService,
        private readonly staticService: StaticService
    ) {}

    async updateTutorial({ id: userId }: UserLike): Promise<void> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using `withTransaction` to handle the transaction automatically
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * CHECK TUTORIAL COMPLETION
                 ************************************************************/
                // Check if last step is reached
                const lastStep = this.tutorialService.isLastStep(user.tutorialStep)
                if (lastStep) {
                    throw new GraphQLError("You have reached the last step of the tutorial", {
                        extensions: {
                            code: "TUTORIAL_LAST_STEP_REACHED"
                        }
                    })
                }

                /************************************************************
                 * PROCESS NEXT TUTORIAL STEP
                 ************************************************************/
                const nextStep = user.tutorialStep + 1

                switch (nextStep) {
                case TutorialStep.StartWaterCropAtStage1: {
                    await this.startWaterCropAtStage1({
                        session,
                        user,
                        nextStep
                    })
                    break
                }
                case TutorialStep.StartWaterCropAtStage2: {
                    await this.startWaterCropAtStage2({
                        session,
                        user,
                        nextStep
                    })
                    break
                }
                case TutorialStep.StartToStage3: {
                    await this.startToStage3({ session, user, nextStep })
                    break
                }
                case TutorialStep.StartHarvestCrop: {
                    await this.startHarvestCrop({ session, user, nextStep })
                    break
                }
                }

                /************************************************************
                 * UPDATE USER TUTORIAL PROGRESS
                 ************************************************************/
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
            })
        } catch (error) {
            this.logger.error(error)
            throw error // Rethrow the error after logging
        } finally {
            await mongoSession.endSession() // Ensure the session is always ended
        }
    }

    // water crop at stage 1
    private async startWaterCropAtStage1({
        session,
        nextStep,
        user
    }: StartWaterCropAtStage1Params): Promise<void> {
        if (nextStep != TutorialStep.StartWaterCropAtStage1) {
            throw new GraphQLError("Invalid tutorial step", {
                extensions: {
                    code: "INVALID_TUTORIAL_STEP"
                }
            })
        }

        // Find the latest 2 crop placed items for this user
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                user: user.id
            })
            .sort({ createdAt: -1 })
            .limit(2)
            .session(session)

        // update the top 2 latested crop to stage 1, and one of them need water
        // the first crop is normal, the second crop is need water
        placedItems[0].seedGrowthInfo.currentState = CropCurrentState.Normal
        placedItems[0].seedGrowthInfo.currentStage = 1
        await placedItems[0].save({ session })

        // the second crop is need water
        placedItems[1].seedGrowthInfo.currentState = CropCurrentState.NeedWater
        placedItems[1].seedGrowthInfo.currentStage = 1
        await placedItems[1].save({ session })
    }

    // water crop at stage 2
    private async startWaterCropAtStage2({
        session,
        nextStep,
        user
    }: StartWaterCropAtStage2Params): Promise<void> {
        if (nextStep != TutorialStep.StartWaterCropAtStage2) {
            throw new GraphQLError("Invalid tutorial step", {
                extensions: {
                    code: "INVALID_TUTORIAL_STEP"
                }
            })
        }

        // Find all crop placed items for this user
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                user: user.id
            })
            .sort({ createdAt: -1 })
            .limit(2)
            .session(session)

        // update the top 2 latested crop to stage 1, and one of them need water
        // the first crop is need water, the second crop is normal
        placedItems[0].seedGrowthInfo.currentState = CropCurrentState.NeedWater
        placedItems[0].seedGrowthInfo.currentStage = 2
        await placedItems[0].save({ session })

        // the second crop is need water
        placedItems[1].seedGrowthInfo.currentState = CropCurrentState.Normal
        placedItems[1].seedGrowthInfo.currentStage = 2
        await placedItems[1].save({ session })
    }

    private async startToStage3({ session, nextStep, user }: StartToStage3Params): Promise<void> {
        if (nextStep != TutorialStep.StartToStage3) {
            throw new GraphQLError("Invalid tutorial step", {
                extensions: {
                    code: "INVALID_TUTORIAL_STEP"
                }
            })
        }

        // Find all crop placed items for this user
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                user: user.id
            })
            .sort({ createdAt: -1 })
            .limit(2)
            .session(session)

        // update the top 2 latested crop to stage 1, and one of them need water
        // the first crop is need water, the second crop is normal
        placedItems[0].seedGrowthInfo.currentState = CropCurrentState.IsInfested
        placedItems[0].seedGrowthInfo.currentStage = 3
        await placedItems[0].save({ session })

        // the second crop is need water
        placedItems[1].seedGrowthInfo.currentState = CropCurrentState.IsWeedy
        placedItems[1].seedGrowthInfo.currentStage = 3
        await placedItems[1].save({ session })
    }

    private async startHarvestCrop({
        session,
        nextStep,
        user
    }: StartHarvestCropParams): Promise<void> {
        if (nextStep != TutorialStep.StartHarvestCrop) {
            throw new GraphQLError("Invalid tutorial step", {
                extensions: {
                    code: "INVALID_TUTORIAL_STEP"
                }
            })
        }

        // Find all crop placed items for this user
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                user: user.id
            })
            .sort({ createdAt: -1 })
            .limit(2)
            .session(session)

        // update the top 2 latested crop to last stage
        placedItems[0].seedGrowthInfo.currentState = CropCurrentState.FullyMatured
        placedItems[0].seedGrowthInfo.currentStage = 4
        await placedItems[0].save({ session })

        // the second crop is need water
        placedItems[1].seedGrowthInfo.currentState = CropCurrentState.FullyMatured
        placedItems[1].seedGrowthInfo.currentStage = 4
        await placedItems[1].save({ session })
    }
}

export interface StartWaterCropAtStage1Params {
    session: ClientSession
    user: UserSchema
    nextStep: TutorialStep
}

export type StartWaterCropAtStage2Params = StartWaterCropAtStage1Params
export type StartWaterCropAtStage3Params = StartWaterCropAtStage1Params
export type StartToStage3Params = StartWaterCropAtStage1Params
export type StartHarvestCropParams = StartWaterCropAtStage1Params

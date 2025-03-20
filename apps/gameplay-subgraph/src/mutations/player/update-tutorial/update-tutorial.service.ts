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
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class UpdateTutorialService {
    private readonly logger = new Logger(UpdateTutorialService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tutorialService: TutorialService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async updateTutorial({ id: userId }: UserLike): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let user: UserSchema | undefined
        try {
            // Using `withTransaction` to handle the transaction automatically
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                user = await this.connection
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
                console.log(nextStep)
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
                user.tutorialStep = nextStep
                await user.save({ session: mongoSession })
            })
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        { value: JSON.stringify({ userId, user: user.toJSON() }) }
                    ]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId }) }]
                })
            ])
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
                user: user.id,
                seedGrowthInfo: {
                    $ne: null
                },
                "seedGrowthInfo.currentStage": 0
            })
            .sort({ createdAt: -1 })
            .limit(2)
            .session(session)
        console.log({
            user: user.id,
            seedGrowthInfo: {
                $ne: null
            },
            "seedGrowthInfo.currentStage": 0
        })
        // update the top 2 latested crop to stage 1, and one of them need water
        // the first crop is normal, the second crop is need water
        const placedItem1 = placedItems.at(0)
        if (!placedItem1) {
            throw new GraphQLError("Placed item 1 not found", {
                extensions: {
                    code: "PLACED_ITEM_1_NOT_FOUND"
                }
            })
        }
        placedItem1.seedGrowthInfo.currentState = CropCurrentState.Normal
        placedItem1.seedGrowthInfo.currentStage = 1
        await placedItem1.save({ session })
        // the second crop is need water
        const placedItem2 = placedItems.at(1)
        if (!placedItem2) {
            throw new GraphQLError("Placed item 2 not found", {
                extensions: {
                    code: "PLACED_ITEM_2_NOT_FOUND"
                }
            })
        }
        placedItem2.seedGrowthInfo.currentState = CropCurrentState.NeedWater
        placedItem2.seedGrowthInfo.currentStage = 1
        await placedItem2.save({ session })
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
                user: user.id,
                seedGrowthInfo: {
                    $ne: null
                },
                "seedGrowthInfo.currentStage": 1
            })
            .sort({ createdAt: -1 })
            .limit(2)
            .session(session)

        // update the top 2 latested crop to stage 1, and one of them need water
        // the first crop is need water, the second crop is normal
        const placedItem1 = placedItems.at(0)
        if (!placedItem1) {
            throw new GraphQLError("Placed item 1 not found", {
                extensions: {
                    code: "PLACED_ITEM_1_NOT_FOUND"
                }
            })
        }
        placedItem1.seedGrowthInfo.currentState = CropCurrentState.NeedWater
        placedItem1.seedGrowthInfo.currentStage = 2
        await placedItem1.save({ session })

        // the second crop is need water
        const placedItem2 = placedItems.at(1)
        if (!placedItem2) {
            throw new GraphQLError("Placed item 2 not found", {
                extensions: {
                    code: "PLACED_ITEM_2_NOT_FOUND"
                }
            })
        }
        placedItem2.seedGrowthInfo.currentState = CropCurrentState.Normal
        placedItem2.seedGrowthInfo.currentStage = 2
        await placedItem2.save({ session })
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
                user: user.id,
                seedGrowthInfo: {
                    $ne: null
                },
                "seedGrowthInfo.currentStage": 2
            })
            .sort({ createdAt: -1 })
            .limit(2)
            .session(session)

        // update the top 2 latested crop to stage 1, and one of them need water
        // the first crop is need water, the second crop is normal
        const placedItem1 = placedItems.at(0)
        if (!placedItem1) {
            throw new GraphQLError("Placed item 1 not found", {
                extensions: {
                    code: "PLACED_ITEM_1_NOT_FOUND"
                }
            })
        }
        placedItem1.seedGrowthInfo.currentState = CropCurrentState.IsInfested
        placedItem1.seedGrowthInfo.currentStage = 3
        await placedItem1.save({ session })

        // the second crop is need water
        const placedItem2 = placedItems.at(1)
        if (!placedItem2) {
            throw new GraphQLError("Placed item 2 not found", {
                extensions: {
                    code: "PLACED_ITEM_2_NOT_FOUND"
                }
            })
        }
        placedItem2.seedGrowthInfo.currentState = CropCurrentState.IsWeedy
        placedItem2.seedGrowthInfo.currentStage = 3
        await placedItem2.save({ session })
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
                user: user.id,
                seedGrowthInfo: {
                    $ne: null
                },
                "seedGrowthInfo.currentStage": 3
            })
            .sort({ createdAt: -1 })
            .limit(2)
            .session(session)
        // update the top 2 latested crop to last stage
        const crop1 = this.staticService.crops.find(
            (crop) => crop.id.toString() === placedItems[0].seedGrowthInfo.crop.toString()
        )
        if (!crop1) {
            throw new GraphQLError("Crop 1 not found", {
                extensions: {
                    code: "CROP_1_NOT_FOUND"
                }
            })
        }
        const placedItem1 = placedItems.at(0)
        if (!placedItem1) {
            throw new GraphQLError("Placed item 1 not found", {
                extensions: {
                    code: "PLACED_ITEM_1_NOT_FOUND"
                }
            })
        }
        placedItem1.seedGrowthInfo.currentState = CropCurrentState.FullyMatured
        placedItem1.seedGrowthInfo.currentStage = 4
        placedItem1.seedGrowthInfo.harvestQuantityRemaining = crop1.maxHarvestQuantity
        await placedItem1.save({ session })

        // the second crop is need water
        const crop2 = this.staticService.crops.find(
            (crop) => crop.id.toString() === placedItems[1].seedGrowthInfo.crop.toString()
        )
        if (!crop2) {
            throw new GraphQLError("Crop 2 not found", {
                extensions: {
                    code: "CROP_2_NOT_FOUND"
                }
            })
        }
        const placedItem2 = placedItems.at(1)
        if (!placedItem2) {
            throw new GraphQLError("Placed item 2 not found", {
                extensions: {
                    code: "PLACED_ITEM_2_NOT_FOUND"
                }
            })
        }
        placedItem2.seedGrowthInfo.currentState = CropCurrentState.FullyMatured
        placedItem2.seedGrowthInfo.currentStage = 4
        placedItem2.seedGrowthInfo.harvestQuantityRemaining = crop2.maxHarvestQuantity
        await placedItem2.save({ session })
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

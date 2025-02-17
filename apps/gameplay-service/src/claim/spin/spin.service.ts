import { Injectable, Logger } from "@nestjs/common"
import {
    AppearanceChance,
    DefaultInfo,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    SPIN_PRIZE,
    SpinInfo,
    SpinPrizeSchema,
    SpinPrizeType,
    SpinSlotSchema,
    SystemId,
    SystemRecord,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, TokenBalanceService } from "@src/gameplay"
import { SpinRequest, SpinResponse } from "./spin.dto"
import { GrpcInternalException } from "nestjs-grpc-exceptions"
import { DateUtcService } from "@src/date"
import { createObjectId, DeepPartial, GrpcFailedPreconditionException } from "@src/common"
import { Connection } from "mongoose"

@Injectable()
export class SpinService {
    private readonly logger = new Logger(SpinService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly inventoryService: InventoryService,
        private readonly dateUtcService: DateUtcService
    ) {}

    async spin(request: SpinRequest): Promise<SpinResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            // Get the default info
            const {
                value: { storageCapacity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                .session(mongoSession)
            // Get latest spin
            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            // check if during 24-hour period user has already spun
            const now = this.dateUtcService.getDayjs()
            if (user.spinLastTime && now.diff(user.spinLastTime, "day") < 1) {
                throw new GrpcFailedPreconditionException("Spin is blocked for 24 hours")
            }

            // Spin the wheel
            const spinSlots = await this.connection
                .model<SpinSlotSchema>(SpinSlotSchema.name)
                .find()
                .populate(SPIN_PRIZE)
                .session(mongoSession)
            //check if slot not equal to 8
            if (spinSlots.length !== 8) {
                throw new GrpcInternalException("Spin slots must be equal to 8")
            }

            //spin
            const { value } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<SystemRecord<SpinInfo>>(createObjectId(SystemId.SpinInfo))
                .session(mongoSession)

            //get the appearance chance
            const chance = this.getAppearanceChance(value)
            //we get the appearance chance, so that we randomly select a slot with that chance
            const rewardableSlots = spinSlots.filter(
                (slot) => (slot.spinPrize as SpinPrizeSchema).appearanceChance === chance
            )
            const selectedSlot = this.getRandomSlot(rewardableSlots)

            // Update user's spin last time
            const userChanges: DeepPartial<UserSchema> = {
                spinLastTime: now.toDate(),
                spinCount: user.spinCount + 1
            }

            let balanceChanges: DeepPartial<UserSchema> = {}
            // Check type, if golds
            const spinPrize = selectedSlot.spinPrize as SpinPrizeSchema
            switch (spinPrize.type) {
            case SpinPrizeType.Gold: {
                //we than process the reward
                balanceChanges = this.goldBalanceService.add({
                    user,
                    amount: spinPrize.quantity
                })
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: user.id },
                        {
                            ...userChanges,
                            ...balanceChanges
                        }
                    )
                    .session(mongoSession)
                break
            }
            case SpinPrizeType.Seed: {
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        crop: spinPrize.crop,
                        type: InventoryType.Seed
                    })
                    .session(mongoSession)
                    // Get inventory same type
                const { count, inventories } = await this.inventoryService.getAddParams({
                    userId: request.userId,
                    inventoryType,
                    session: mongoSession,
                    connection: this.connection
                })
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventories,
                    userId: request.userId,
                    capacity: storageCapacity,
                    inventoryType,
                    quantity: spinPrize.quantity,
                    count
                })
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: user.id },
                        {
                            ...userChanges,
                            ...balanceChanges
                        }
                    )
                    .session(mongoSession)

                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(createdInventories, { session: mongoSession })
                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(mongoSession)
                }

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: user.id },
                        {
                            ...userChanges,
                            ...balanceChanges
                        }
                    )
                    .session(mongoSession)

                break
            }
            case SpinPrizeType.Supply: {
                const inventoryType = await this.connection
                    .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                    .findOne({
                        supply: spinPrize.supply,
                        type: InventoryType.Supply
                    })
                    .session(mongoSession)
                    // Get inventory same type
                    //
                const { count, inventories } = await this.inventoryService.getAddParams({
                    userId: request.userId,
                    inventoryType,
                    session: mongoSession,
                    connection: this.connection
                })
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventories,
                    userId: request.userId,
                    capacity: storageCapacity,
                    inventoryType,
                    quantity: spinPrize.quantity,
                    count
                })
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(createdInventories, { session: mongoSession })
                for (const inventory of updatedInventories) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .updateOne({ _id: inventory._id }, inventory)
                        .session(mongoSession)
                }
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: user.id },
                        {
                            ...userChanges,
                            ...balanceChanges
                        }
                    )
                    .session(mongoSession)
                break
            }
            case SpinPrizeType.Token: {
                balanceChanges = this.tokenBalanceService.add({
                    user,
                    amount: spinPrize.quantity
                })
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: user.id },
                        {
                            ...userChanges,
                            ...balanceChanges
                        }
                    )
                    .session(mongoSession)
                break
            }
            }

            await mongoSession.commitTransaction()
            return { spinSlotId: selectedSlot.id }
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }

    //detach random slot function to mock it with jest.spyOn
    public getRandomSlot(rewardableSlots: Array<SpinSlotSchema>): DeepPartial<SpinSlotSchema> {
        const randomIndex = Math.floor(Math.random() * rewardableSlots.length)
        return rewardableSlots[randomIndex]
    }

    //get appearance chance function to mock it with jest.spyOn
    public getAppearanceChance(spinInfo: SpinInfo): AppearanceChance {
        const random = Math.random()
        for (const [key, value] of Object.entries(spinInfo.appearanceChanceSlots)) {
            if (random >= value.thresholdMin && random < value.thresholdMax) {
                return key as AppearanceChance
            }
        }
        return AppearanceChance.Common // Default fallback
    }
}

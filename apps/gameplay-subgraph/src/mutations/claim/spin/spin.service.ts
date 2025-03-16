import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger
} from "@nestjs/common"
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
    KeyValueRecord,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, TokenBalanceService } from "@src/gameplay"
import { SpinResponse } from "./spin.dto"
import { DateUtcService } from "@src/date"
import { createObjectId, DeepPartial } from "@src/common"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"

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

    async spin({ id: userId }: UserLike): Promise<SpinResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async () => {
                // Get the default info
                const {
                    value: { storageCapacity }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                    .session(mongoSession)

                // Get latest spin info
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // Check if the user has already spun within the 24-hour period
                const now = this.dateUtcService.getDayjs()
                if (user.spinLastTime && now.diff(user.spinLastTime, "day") < 1) {
                    throw new BadRequestException("Spin is blocked for 24 hours")
                }

                // Get spin slots and check if slot count is correct
                const spinSlots = await this.connection
                    .model<SpinSlotSchema>(SpinSlotSchema.name)
                    .find()
                    .populate(SPIN_PRIZE)
                    .session(mongoSession)
                if (spinSlots.length !== 8) {
                    throw new InternalServerErrorException("Spin slots must be equal to 8")
                }

                // Get spin info and appearance chance
                const { value } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<SpinInfo>>(createObjectId(SystemId.SpinInfo))
                    .session(mongoSession)

                const chance = this.getAppearanceChance(value)
                const rewardableSlots = spinSlots.filter(
                    (slot) => (slot.spinPrize as SpinPrizeSchema).appearanceChance === chance
                )
                const selectedSlot = this.getRandomSlot(rewardableSlots)

                // Update user's spin last time and spin count
                const userChanges: DeepPartial<UserSchema> = {
                    spinLastTime: now.toDate(),
                    spinCount: user.spinCount + 1
                }

                let balanceChanges: DeepPartial<UserSchema> = {}

                // Process the prize based on type
                const spinPrize = selectedSlot.spinPrize as SpinPrizeSchema
                switch (spinPrize.type) {
                case SpinPrizeType.Gold: {
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

                    const { occupiedIndexes, inventories } =
                            await this.inventoryService.getAddParams({
                                userId,
                                inventoryType,
                                session: mongoSession,
                                connection: this.connection
                            })

                    const { createdInventories, updatedInventories } =
                            this.inventoryService.add({
                                inventories,
                                userId,
                                capacity: storageCapacity,
                                inventoryType,
                                quantity: spinPrize.quantity,
                                occupiedIndexes
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

                    const { occupiedIndexes, inventories } =
                            await this.inventoryService.getAddParams({
                                userId,
                                inventoryType,
                                session: mongoSession,
                                connection: this.connection
                            })

                    const { createdInventories, updatedInventories } =
                            this.inventoryService.add({
                                inventories,
                                userId,
                                capacity: storageCapacity,
                                inventoryType,
                                quantity: spinPrize.quantity,
                                occupiedIndexes
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

                return { spinSlotId: selectedSlot.id }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }

    // Randomly select a spin slot
    public getRandomSlot(rewardableSlots: Array<SpinSlotSchema>): DeepPartial<SpinSlotSchema> {
        const randomIndex = Math.floor(Math.random() * rewardableSlots.length)
        return rewardableSlots[randomIndex]
    }

    // Get the appearance chance based on the spin info
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

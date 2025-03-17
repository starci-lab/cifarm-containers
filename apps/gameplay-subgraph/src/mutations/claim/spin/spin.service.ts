import {
    Injectable,
    Logger
} from "@nestjs/common"
import {
    AppearanceChance,
    InjectMongoose,
    InventorySchema,
    InventoryType,
    InventoryTypeSchema,
    SPIN_PRIZE,
    SpinInfo,
    SpinPrizeSchema,
    SpinPrizeType,
    SpinSlotSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, StaticService, TokenBalanceService } from "@src/gameplay"
import { SpinResponse } from "./spin.dto"
import { DateUtcService } from "@src/date"
import { DeepPartial } from "@src/common"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class SpinService {
    private readonly logger = new Logger(SpinService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly inventoryService: InventoryService,
        private readonly dateUtcService: DateUtcService,
        private readonly staticService: StaticService       
    ) {}

    async spin({ id: userId }: UserLike): Promise<SpinResponse> {
        const session = await this.connection.startSession()
        try {
            const result = await session.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE CONFIGURATION DATA
                 ************************************************************/
                // Get the default info
                const { storageCapacity } = this.staticService.defaultInfo

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get latest spin info
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * CHECK SPIN ELIGIBILITY
                 ************************************************************/
                // Check if the user has already spun within the 24-hour period
                const now = this.dateUtcService.getDayjs()
                if (user.spinLastTime && now.diff(user.spinLastTime, "day") < 1) {
                    throw new GraphQLError("Spin is blocked for 24 hours", {
                        extensions: {
                            code: "SPIN_BLOCKED"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE SPIN SLOTS
                 ************************************************************/
                // Get spin slots and check if slot count is correct
                const spinSlots = await this.connection
                    .model<SpinSlotSchema>(SpinSlotSchema.name)
                    .find()
                    .populate(SPIN_PRIZE)
                    .session(session)
                
                if (spinSlots.length !== 8) {
                    throw new GraphQLError("Spin slots must be equal to 8", {
                        extensions: {
                            code: "INVALID_SPIN_SLOTS_COUNT"
                        }
                    })
                }

                /************************************************************
                 * DETERMINE SPIN RESULT
                 ************************************************************/
                // Get spin info and appearance chance
                const { spinInfo } = this.staticService

                const chance = this.getAppearanceChance(spinInfo)
                const rewardableSlots = spinSlots.filter(
                    (slot) => (slot.spinPrize as SpinPrizeSchema).appearanceChance === chance
                )
                const selectedSlot = this.getRandomSlot(rewardableSlots)

                /************************************************************
                 * PREPARE USER UPDATES
                 ************************************************************/
                // Update user's spin last time and spin count
                user.spinLastTime = now.toDate()
                user.spinCount += 1

                /************************************************************
                 * PROCESS PRIZE BASED ON TYPE
                 ************************************************************/
                // Process the prize based on type
                const spinPrize = selectedSlot.spinPrize as SpinPrizeSchema
                switch (spinPrize.type) {
                case SpinPrizeType.Gold: {
                    /************************************************************
                     * PROCESS GOLD PRIZE
                     ************************************************************/
                    this.goldBalanceService.add({
                        user,
                        amount: spinPrize.quantity
                    })  
                    
                    // Update user with gold changes
                    await user.save({ session })
                    break
                }
                case SpinPrizeType.Seed: {
                    /************************************************************
                     * PROCESS SEED PRIZE
                     ************************************************************/
                    const inventoryType = await this.connection
                        .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                        .findOne({
                            crop: spinPrize.crop,
                            type: InventoryType.Seed
                        })
                        .session(session)

                    if (!inventoryType) {
                        throw new GraphQLError("Inventory seed type not found", {
                            extensions: {
                                code: "INVENTORY_SEED_TYPE_NOT_FOUND"
                            }
                        })
                    }

                    const { occupiedIndexes, inventories } =
                            await this.inventoryService.getAddParams({
                                userId,
                                inventoryType,
                                session,
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

                    // Update user data
                    await user.save({ session })

                    // Create new inventory items
                    if (createdInventories.length > 0) {
                        await this.connection
                            .model<InventorySchema>(InventorySchema.name)
                            .create(createdInventories, { session })
                    }
                    
                    // Update existing inventory items
                    for (const inventory of updatedInventories) {
                        await inventory.save({ session })
                    }

                    break
                }
                case SpinPrizeType.Supply: {
                    /************************************************************
                     * PROCESS SUPPLY PRIZE
                     ************************************************************/
                    const inventoryType = await this.connection
                        .model<InventoryTypeSchema>(InventoryTypeSchema.name)
                        .findOne({
                            supply: spinPrize.supply,
                            type: InventoryType.Supply
                        })
                        .session(session)

                    if (!inventoryType) {
                        throw new GraphQLError("Inventory supply type not found", {
                            extensions: {
                                code: "INVENTORY_SUPPLY_TYPE_NOT_FOUND"
                            }
                        })
                    }

                    const { occupiedIndexes, inventories } =
                            await this.inventoryService.getAddParams({
                                userId,
                                inventoryType,
                                session,
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

                    // Update user data
                    await user.save({ session })

                    // Create new inventory items
                    if (createdInventories.length > 0) {
                        await this.connection
                            .model<InventorySchema>(InventorySchema.name)
                            .create(createdInventories, { session })
                    }
                    
                    // Update existing inventory items
                    for (const inventory of updatedInventories) {
                        await inventory.save({ session })
                    }

                    break
                }
                case SpinPrizeType.Token: {
                    /************************************************************
                     * PROCESS TOKEN PRIZE
                     ************************************************************/
                    this.tokenBalanceService.add({
                        user,
                        amount: spinPrize.quantity
                    })
                    
                    // Update user with token changes
                    await user.save({ session })
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
            await session.endSession()
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

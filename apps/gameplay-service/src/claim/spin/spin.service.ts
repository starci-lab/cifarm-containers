import { Injectable, Logger } from "@nestjs/common"
import {
    AppearanceChance,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    SpinInfo,
    SpinPrizeType,
    SpinSlotEntity,
    SystemEntity,
    SystemId,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, TokenBalanceService } from "@src/gameplay"
import { DataSource, DeepPartial } from "typeorm"
import { SpinRequest, SpinResponse } from "./spin.dto"
import { GrpcInternalException } from "nestjs-grpc-exceptions"
import { DateUtcService } from "@src/date"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class SpinService {
    private readonly logger = new Logger(SpinService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly inventoryService: InventoryService,
        private readonly dateUtcService: DateUtcService
    ) {}

    async spin(request: SpinRequest): Promise<SpinResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Get latest spin
            const user = await queryRunner.manager.findOne(UserSchema, {
                where: { id: request.userId }
            })

            // check if during 24-hour period user has already spun
            const now = this.dateUtcService.getDayjs()
            if (user.spinLastTime && now.diff(user.spinLastTime, "day") < 1) {
                throw new GrpcFailedPreconditionException("Spin is blocked for 24 hours")
            }

            // Spin the wheel
            const spinSlots = await queryRunner.manager.find(SpinSlotEntity, {
                relations: {
                    spinPrize: true
                }
            })

            //check if slot not equal to 8
            if (spinSlots.length !== 8) {
                throw new GrpcInternalException("Spin slots must be equal to 8")
            }

            //spinnn
            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.SpinInfo }
            })
            
            //get the appearance chance
            const chance = this.getAppearanceChance(value as SpinInfo)

            //we get the appearance chance, so that we randomly select a slot with that chance
            const rewardableSlots = spinSlots.filter(
                (slot) => slot.spinPrize.appearanceChance === chance
            )
            const selectedSlot = this.getRandomSlot(rewardableSlots)

            // Update user's spin last time
            const userChanges: DeepPartial<UserSchema> = {
                spinLastTime: now.toDate(),
                spinCount: user.spinCount + 1
            }

            let balanceChanges: DeepPartial<UserSchema> = {}
            // Check type, if golds
            switch (selectedSlot.spinPrize.type) {
            case SpinPrizeType.Gold: {
                //we than process the reward
                balanceChanges = this.goldBalanceService.add({
                    entity: user,
                    amount: selectedSlot.spinPrize.golds
                })
                await queryRunner.startTransaction()
                try {
                    await queryRunner.manager.update(UserSchema, user.id, {
                        ...userChanges,
                        ...balanceChanges
                    })
                    await queryRunner.commitTransaction()
                } catch (error) {
                    const errorMessage = `Transaction failed, reason: ${error.message}`
                    this.logger.error(errorMessage)
                    await queryRunner.rollbackTransaction()
                    throw new GrpcInternalException(errorMessage)
                }
                break
            }
            case SpinPrizeType.Seed: {
                // Get inventory type
                const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                    where: {
                        cropId: selectedSlot.spinPrize.cropId,
                        type: InventoryType.Seed
                    }
                })
                // Get inventory same type
                const inventories = await queryRunner.manager.find(InventoryEntity, {
                    where: {
                        userId: request.userId,
                        inventoryTypeId: inventoryType.id
                    },
                    relations: {
                        inventoryType: true
                    }
                })
                const updatedInventories = this.inventoryService.add({
                    entities: inventories,
                    userId: request.userId,
                    data: {
                        inventoryType: inventoryType,
                        quantity: selectedSlot.spinPrize.quantity
                    }
                })

                await queryRunner.startTransaction()
                try {
                    // Save user and inventory
                    await queryRunner.manager.update(UserSchema, user.id, {
                        ...userChanges,
                        ...balanceChanges
                    })
                    await queryRunner.manager.save(InventoryEntity, updatedInventories)
                    await queryRunner.commitTransaction()
                } catch (error) {
                    const errorMessage = `Transaction failed, reason: ${error.message}`
                    this.logger.error(errorMessage)
                    await queryRunner.rollbackTransaction()
                    throw new GrpcInternalException(errorMessage)
                }
                break
            }
            case SpinPrizeType.Supply: {
                // Get inventory type
                const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                    where: {
                        cropId: selectedSlot.spinPrize.cropId,
                        type: InventoryType.Supply
                    }
                })
                // Get inventory same type
                const inventories = await queryRunner.manager.find(InventoryEntity, {
                    where: {
                        userId: request.userId,
                        inventoryTypeId: inventoryType.id
                    },
                    relations: {
                        inventoryType: true
                    }
                })
                const updatedInventories = this.inventoryService.add({
                    entities: inventories,
                    userId: request.userId,
                    data: {
                        inventoryType: inventoryType,
                        quantity: selectedSlot.spinPrize.quantity
                    }
                })
                await queryRunner.startTransaction()
                try {
                    await queryRunner.manager.update(UserSchema, user.id, {
                        ...userChanges,
                        ...balanceChanges
                    })
                    await queryRunner.manager.save(InventoryEntity, updatedInventories)
                    await queryRunner.commitTransaction()
                } catch (error) {
                    const errorMessage = `Transaction failed, reason: ${error.message}`
                    this.logger.error(errorMessage)
                    await queryRunner.rollbackTransaction()
                    throw new GrpcInternalException(errorMessage)
                }
                break
            }
            case SpinPrizeType.Token: {
                balanceChanges = this.tokenBalanceService.add({
                    entity: user,
                    amount: selectedSlot.spinPrize.tokens
                })
                await queryRunner.startTransaction()
                try {
                    await queryRunner.manager.update(UserSchema, user.id, {
                        ...userChanges,
                        ...balanceChanges
                    })
                    await queryRunner.commitTransaction()
                } catch (error) {
                    const errorMessage = `Transaction failed, reason: ${error.message}`
                    this.logger.error(errorMessage)
                    await queryRunner.rollbackTransaction()
                    throw new GrpcInternalException(errorMessage)
                }
                break
            }
            }
            return { spinSlotId: selectedSlot.id }
        } finally {
            await queryRunner.release()
        }
    }

    //detach random slot function to mock it with jest.spyOn
    public getRandomSlot(rewardableSlots: Array<SpinSlotEntity>): DeepPartial<SpinSlotEntity> {
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

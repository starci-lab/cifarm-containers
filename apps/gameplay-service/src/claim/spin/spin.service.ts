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
    UserEntity
} from "@src/databases"
import { GoldBalanceService, InventoryService, TokenBalanceService } from "@src/gameplay"
import { DataSource, DeepPartial } from "typeorm"
import { SpinRequest, SpinResponse } from "./spin.dto"
import { GrpcInternalException, GrpcPermissionDeniedException } from "nestjs-grpc-exceptions"
import { createUtcDayjs } from "@src/common"

@Injectable()
export class SpinService {
    private readonly logger = new Logger(SpinService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly inventoryService: InventoryService
    ) {
    }

    async spin(request: SpinRequest): Promise<SpinResponse> {
        this.logger.debug(`Spin called, user: ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Get latest spin
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            // check if during 24-hour period user has already spun
            const now = createUtcDayjs()
            if (user.spinLastTime && now.diff(user.spinLastTime, "day") < 1) {
                throw new GrpcPermissionDeniedException("Spin is blocked for 24 hours")
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
            const random = Math.random()

            let chance: AppearanceChance = AppearanceChance.Common
            const { appearanceChanceSlots } = value as SpinInfo
            for (const [key, value] of Object.entries(appearanceChanceSlots)) {
                if (random >= value.thresholdMin && random < value.thresholdMax)
                    chance = key as AppearanceChance
                break
            }

            //we get the appearance chance, so that we randomly select a slot with that chance
            const rewardableSlots = spinSlots.filter(
                (slot) => slot.spinPrize.appearanceChance === chance
            )
            const randomIndex = Math.floor(Math.random() * rewardableSlots.length)
            const selectedSlot = rewardableSlots[randomIndex]

            // Update user's spin last time
            const userChanges: DeepPartial<UserEntity> = {
                spinLastTime: now.toDate(),
                spinCount: user.spinCount + 1
            }

            let balanceChanges: DeepPartial<UserEntity> = {}
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
                    await queryRunner.manager.update(UserEntity, user.id, {
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
                    await queryRunner.manager.update(UserEntity, user.id, {
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
                    await queryRunner.manager.update(UserEntity, user.id, {
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
                    await queryRunner.manager.update(UserEntity, user.id, {
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
            this.logger.log(
                `Successfully spun the wheel for user ${request.userId}, selected slot id: ${selectedSlot.id}`
            )
            return { spinSlotId: selectedSlot.id }
        } catch (error) {
            this.logger.error("Spin failed", error)
            throw error
        }
        finally {
            await queryRunner.release()
        }
    }
}

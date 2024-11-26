import { Injectable, Logger } from "@nestjs/common"
import {
    CropEntity,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    UserEntity
} from "@src/database"
import {
    BuySeedsTransactionFailedException,
    CropNotAvailableInShopException,
    CropNotFoundException
} from "@src/exceptions"
import { GoldBalanceService, InventoryService } from "@src/services"
import { DataSource } from "typeorm"
import { BuySeedsRequest, BuySeedsResponse } from "./buy-seeds.dto"

@Injectable()
export class BuySeedsService {
    private readonly logger = new Logger(BuySeedsService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService
    ) {}

    async buySeeds(request: BuySeedsRequest): Promise<BuySeedsResponse> {
        this.logger.debug(
            `Calling buying seed for user ${request.userId}, id: ${request.cropId}, quantity: ${request.quantity}`
        )
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        const crop = await queryRunner.manager.findOne(CropEntity, {
            where: { id: request.cropId }
        })

        if (!crop) throw new CropNotFoundException(request.cropId)
        if (!crop.availableInShop) throw new CropNotAvailableInShopException(request.cropId)

        const totalCost = crop.price * request.quantity

        const user: UserEntity = await queryRunner.manager.findOne(UserEntity, {
            where: { id: request.userId }
        })

        //Check sufficient gold
        this.goldBalanceService.checkSufficient({ current: user.golds, required: totalCost })

        // Start transaction
        await queryRunner.startTransaction()

        try {
            // Subtract gold
            const goldsChanged = this.goldBalanceService.subtract({
                entity: user,
                golds: totalCost
            })

            await queryRunner.manager.update(UserEntity, user.id, {
                ...goldsChanged
            })

            //Get inventory type
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: { cropId: request.cropId, type: InventoryType.Seed }
            })

            // Get inventory same type
            const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    userId: request.userId,
                    inventoryTypeId: inventoryType.id
                },
                relations: {
                    inventoryType: true
                }
            })
            const updatedInventories = this.inventoryService.add({
                entities: existingInventories,
                userId: request.userId,
                data: {
                    inventoryType: inventoryType,
                    quantity: request.quantity
                }
            })

            //Save inventory
            await queryRunner.manager.save(InventoryEntity, updatedInventories)
            await queryRunner.commitTransaction()
 
            return 
        } catch (error) {
            this.logger.error(JSON.stringify(error.message))
            await queryRunner.rollbackTransaction()
            throw new BuySeedsTransactionFailedException(error)
        } finally {
            await queryRunner.release()
        }
    }
}

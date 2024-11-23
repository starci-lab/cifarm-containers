import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { IWalletService } from "@src/containers/wallet-service"
import { CropEntity } from "@src/database"
import {
    CropNotAvailableInShopException,
    CropNotFoundException,
    UserInsufficientGoldException
} from "@src/exceptions"
import { InventoryService } from "@src/services"
import { Cache } from "cache-manager"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { BuySeedsRequest, BuySeedsResponse } from "./buy-seeds.dto"

@Injectable()
export class BuySeedsService {
    private readonly logger = new Logger(BuySeedsService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        private readonly walletService: IWalletService,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    async buySeeds(request: BuySeedsRequest): Promise<BuySeedsResponse> {
        this.logger.debug(
            `Buying seed for user ${request.userId}, id: ${request.id}, quantity: ${request.quantity}`
        )

        const crop = await this.dataSource.manager.findOne(CropEntity, {
            where: { id: request.id }
        })
        if (!crop) throw new CropNotFoundException(request.id)
        if (!crop.availableInShop) throw new CropNotAvailableInShopException(request.id)

        const totalCost = crop.price * request.quantity
        this.logger.debug(`Total cost: ${totalCost}`)

        const balance = await lastValueFrom(
            this.walletService.getGoldBalance({ userId: request.userId })
        )
        if (balance.golds < totalCost)
            throw new UserInsufficientGoldException(balance.golds, totalCost)

        await lastValueFrom(
            this.walletService.subtractGold({ userId: request.userId, golds: totalCost })
        )

        await this.inventoryService.addInventory({
            userId: request.userId,
            inventory: {
                inventoryType: {
                    id: request.id
                },
                quantity: request.quantity
            }
        })

        return
    }
}

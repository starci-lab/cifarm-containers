import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { CropEntity, InventoryEntity, InventoryType } from "@src/database"
import { IWalletService } from "@src/services/wallet"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { BuySeedsRequest, BuySeedsResponse } from "./buy-seeds.dto"
import { REDIS_KEY } from "@src/constants"
import { lastValueFrom } from "rxjs"


@Injectable()
export class BuySeedsService {
    private readonly logger = new Logger(BuySeedsService.name)
    private walletService: IWalletService

    constructor(
        private readonly dataSource: DataSource,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,    
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>(
            walletGrpcConstants.SERVICE
        )
    }

    async buySeeds(request: BuySeedsRequest): Promise<BuySeedsResponse> {
        const { key, quantity, userId } = request
        this.logger.debug(`Buying seed for user ${userId} key: ${key} quantity: ${quantity}`)

        // Fetch crop details (Get from cache or DB)
        let crops = await this.cacheManager.get<Array<CropEntity>>(REDIS_KEY.CROPS)
        if (!crops) {
            crops = await this.dataSource.manager.find(CropEntity)
            await this.cacheManager.set(REDIS_KEY.CROPS, crops, Infinity)
        }
        const crop = crops.find(c => c.id.toString() === key)
        if (!crop) throw new NotFoundException("Crop not found")
        if (!crop.availableInShop) throw new Error("Crop not available in shop")

        // Calculate total cost
        const totalCost = crop.price * quantity

        // Check Balance
        const balance = await lastValueFrom(this.walletService.getBalance({ userId }))
        this.logger.debug(`Buying seed for user ${userId} golds: ${balance.golds} tokens: ${balance.tokens}`)
        if (balance.golds < totalCost) throw new Error("Insufficient gold balance")
    
        // Update wallet
        const walletRequest = { userId, goldAmount: totalCost }
        this.logger.debug(`Updating wallet for user ${userId} by deducting golds: ${totalCost}`)
        const response = await lastValueFrom(this.walletService.subtractGold(walletRequest))
        console.log(response.message)

        this.logger.debug(`Buying seed for user ${userId} golds: ${balance.golds} tokens: ${balance.tokens}`)

        // Update Inventory with max stack handling
        const maxStack = 16 // Default max stack of crops
        let remainingQuantity = quantity

        while (remainingQuantity > 0) {
            let inventory = await this.dataSource.manager.findOne(InventoryEntity, {
                where: { referenceKey: key, userId }
            })

            if (inventory) {
                // Calculate available space in the current stack
                const spaceInCurrentStack = maxStack - Number(inventory.quantity)

                if (spaceInCurrentStack > 0) {
                    const quantityToAdd = Math.min(spaceInCurrentStack, remainingQuantity)
                    inventory.quantity += quantityToAdd
                    remainingQuantity -= quantityToAdd
                    await this.dataSource.manager.save(inventory)
                } else {
                    // If inventory is at max stack, create a new one
                    inventory = this.dataSource.manager.create(InventoryEntity, {
                        referenceKey: key,
                        userId,
                        quantity: Math.min(maxStack, remainingQuantity),
                        type: InventoryType.Seed,
                        placeable: true,
                        isPlaced: false,
                        premium: crop.premium,
                        deliverable: true,
                        asTool: false,
                        maxStack,
                    })
                    remainingQuantity -= Number(inventory.quantity)
                    await this.dataSource.manager.save(inventory)
                }
            } else {
                // No existing inventory, create a new one
                inventory = this.dataSource.manager.create(InventoryEntity, {
                    referenceKey: key,
                    userId,
                    quantity: Math.min(maxStack, remainingQuantity),
                    type: InventoryType.Seed,
                    placeable: true,
                    isPlaced: false,
                    premium: crop.premium,
                    deliverable: true,
                    asTool: false,
                    maxStack,
                })
                remainingQuantity -= Number(inventory.quantity)
                await this.dataSource.manager.save(inventory)
            }
            return { inventorySeedKey: inventory.id }
        }
    }
}

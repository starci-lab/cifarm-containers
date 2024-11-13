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
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"


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
            throw new GrpcNotFoundException("User Not Found.")
        }
        crops = await this.dataSource.manager.find(CropEntity)
        await this.cacheManager.set(REDIS_KEY.CROPS, crops, Infinity)

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

        // Set maxStack from the crop's maxStack attribute
        const maxStack = crop.maxStack
        let remainingQuantity = quantity

        // Fetch all inventory items for this user and seed type
        const inventories = await this.dataSource.manager.find(InventoryEntity, {
            where: { referenceKey: key, userId }
        })

        for (const inventory of inventories) {
            if (remainingQuantity <= 0) break

            // Calculate available space in the current stack
            const spaceInCurrentStack = maxStack - inventory.quantity
            if (spaceInCurrentStack > 0) {
                const quantityToAdd = Math.min(spaceInCurrentStack, remainingQuantity)
                inventory.quantity += quantityToAdd
                remainingQuantity -= quantityToAdd
                await this.dataSource.manager.save(inventory)
            }
        }

        // If there is still remaining quantity, create new inventory stacks
        while (remainingQuantity > 0) {
            const newQuantity = Math.min(maxStack, remainingQuantity)
            const newInventory = this.dataSource.manager.create(InventoryEntity, {
                referenceKey: key,
                userId,
                quantity: newQuantity,
                type: InventoryType.Seed,
                placeable: true,
                isPlaced: false,
                premium: crop.premium,
                deliverable: true,
                asTool: false,
                maxStack,
            })
            remainingQuantity -= newQuantity
            await this.dataSource.manager.save(newInventory)
        }

        // Return a response indicating the operation was successful
        return { inventoryKey: key }
    }
}

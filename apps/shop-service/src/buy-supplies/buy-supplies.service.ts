// buy-supplies.service.ts

import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { REDIS_KEY } from "@src/constants"
import { InventoryEntity, InventoryType, SupplyEntity } from "@src/database"
import { IWalletService } from "@src/services/wallet"
import { Cache } from "cache-manager"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { BuySuppliesRequest, BuySuppliesResponse } from "./buy-supplies.dto"

@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)
    private walletService: IWalletService

    constructor(
        private readonly dataSource: DataSource,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>(
            walletGrpcConstants.SERVICE
        )
    }

    async buySupplies(request: BuySuppliesRequest): Promise<BuySuppliesResponse> {
        const { key, quantity, userId } = request
        this.logger.debug(`Buying supply for user ${userId} key: ${key} quantity: ${quantity}`)

        // Fetch supply details (Get from cache or DB)
        let supplies = await this.cacheManager.get<Array<SupplyEntity>>(REDIS_KEY.SUPPLIES)
        if (!supplies) {
            supplies = await this.dataSource.manager.find(SupplyEntity)
            await this.cacheManager.set(REDIS_KEY.SUPPLIES, supplies, Infinity)
        }
        const supply = supplies.find(s => s.id.toString() === key)
        if (!supply) throw new NotFoundException("Supply not found")
        if (!supply.availableInShop) throw new Error("Supply not available in shop")

        // Calculate total cost
        const totalCost = supply.price * quantity

        // Check Balance
        const balance = await lastValueFrom(this.walletService.getBalance({ userId }))
        this.logger.debug(`User ${userId} has golds: ${balance.golds}, tokens: ${balance.tokens}`)
        if (balance.golds < totalCost) throw new Error("Insufficient gold balance")

        // Update wallet
        const walletRequest = { userId, goldAmount: -totalCost }
        this.logger.debug(`Updating wallet for user ${userId} by deducting golds: ${totalCost}`)
        await lastValueFrom(this.walletService.subtractGold(walletRequest))

        // Update Inventory with max stack handling
        const maxStack = supplies.maxStack
        let remainingQuantity = quantity

        // Fetch all inventory items for this user and supply type
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
                tokenId: null, // Id?
                quantity: newQuantity,
                type: InventoryType.Supply,
                placeable: true,
                isPlaced: false,
                // premium: supply.premium,
                deliverable: true,
                asTool: true, // Supplies are tools
                maxStack,
            })
            remainingQuantity -= newQuantity
            await this.dataSource.manager.save(newInventory)
        }

        // Return a response indicating the operation was successful
        return { inventoryKey: key }
    }
}

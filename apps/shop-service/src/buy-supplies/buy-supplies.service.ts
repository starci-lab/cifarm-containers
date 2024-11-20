// buy-supplies.service.ts

import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { REDIS_KEY } from "@src/constants"
import { InventoryType, SupplyEntity } from "@src/database"
import { Cache } from "cache-manager"
import {
    GrpcAbortedException,
    GrpcNotFoundException,
    GrpcPermissionDeniedException
} from "nestjs-grpc-exceptions"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { BuySuppliesRequest, BuySuppliesResponse } from "./buy-supplies.dto"
import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { IWalletService } from "@src/containers/wallet-service"
import { InventoryService } from "../inventory"

@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)
    private walletService: IWalletService

    constructor(
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>(walletGrpcConstants.SERVICE)
    }

    async buySupplies(request: BuySuppliesRequest): Promise<BuySuppliesResponse> {
        const { key, quantity, userId } = request
        this.logger.debug(`Buying supply for user ${userId} key: ${key} quantity: ${quantity}`)

        // Fetch supply details (Get from cache or DB)
        let supplies: Array<SupplyEntity> = await this.cacheManager.get<Array<SupplyEntity>>(
            REDIS_KEY.SUPPLIES
        )
        if (!supplies) {
            supplies = await this.dataSource.manager.find(SupplyEntity)
            await this.cacheManager.set(REDIS_KEY.SUPPLIES, supplies, Infinity)
        }
        const supply: SupplyEntity = supplies.find((s) => s.id.toString() === key)
        if (!supply) throw new GrpcNotFoundException("Supply not found")
        if (!supply.availableInShop) {
            throw new GrpcPermissionDeniedException("Supply not available in shop")
        }

        // Calculate total cost
        const totalCost = supply.price * quantity

        // Check Balance
        const balance = await lastValueFrom(this.walletService.getGoldBalance({ userId }))
        if (balance.golds < totalCost) throw new GrpcAbortedException("Insufficient gold balance")

        await lastValueFrom(this.walletService.subtractGold({ userId, golds: totalCost }))
        await this.inventoryService.addInventory({
            userId,
            key,
            quantity,
            maxStack: supply.maxStack,
            type: InventoryType.Supply,
            placeable: true,
            isPlaced: false,
            premium: false,
            deliverable: true,
            asTool: false
        })

        return { inventoryKey: key }
    }
}

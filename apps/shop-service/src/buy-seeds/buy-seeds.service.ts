import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { REDIS_KEY } from "@src/constants"
import { IWalletService } from "@src/containers/wallet-service"
import { CropEntity, InventoryType } from "@src/database"
import { Cache } from "cache-manager"
import {
    GrpcAbortedException,
    GrpcNotFoundException,
    GrpcPermissionDeniedException
} from "nestjs-grpc-exceptions"
import { lastValueFrom } from "rxjs"
import { DataSource } from "typeorm"
import { InventoryService } from "../inventory"
import { BuySeedsRequest, BuySeedsResponse } from "./buy-seeds.dto"

@Injectable()
export class BuySeedsService {
    private readonly logger = new Logger(BuySeedsService.name)
    private walletService: IWalletService

    constructor(
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>(walletGrpcConstants.SERVICE)
    }

    async buySeeds(request: BuySeedsRequest): Promise<BuySeedsResponse> {
        const { key, quantity, userId } = request
        this.logger.debug(`Buying seed for user ${userId}, key: ${key}, quantity: ${quantity}`)

        const crops = await this.cacheManager.get<Array<CropEntity>>(REDIS_KEY.CROPS)
        const crop = crops.find((c) => c.id.toString() === key.toString())
        if (!crop) throw new GrpcNotFoundException("Crop not found or invalid key: " + key)
        if (!crop.availableInShop)
            throw new GrpcPermissionDeniedException("Crop not available in shop")

        const totalCost = crop.price * quantity

        this.logger.debug(`Total cost: ${totalCost}`)

        const balance = await lastValueFrom(this.walletService.getGoldBalance({ userId }))
        if (balance.golds < totalCost) throw new GrpcAbortedException("Insufficient gold balance")

        this.logger.debug(`Balance: ${balance.golds}`)

        await lastValueFrom(this.walletService.subtractGold({ userId, golds: totalCost }))

        await this.inventoryService.addInventory({
            userId,
            key,
            quantity,
            maxStack: crop.maxStack,
            type: InventoryType.Seed,
            placeable: true,
            isPlaced: false,
            premium: crop.premium,
            deliverable: true,
            asTool: false
        })

        return {
            inventoryKey: "Successfully bought seeds"
        }
    }
}

import { goldWalletGrpcConstants } from "@apps/gold-wallet-service/src/constants"
import { GoldRequest } from "@apps/gold-wallet-service/src/update-gold-wallet"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { IGoldWalletService } from "@src/services/wallet"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)
    private GoldWalletService: IGoldWalletService
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        @Inject(goldWalletGrpcConstants.NAME) private client: ClientGrpc
    ) {}

    onModuleInit() {
        this.GoldWalletService = this.client.getService<IGoldWalletService>(
            goldWalletGrpcConstants.SERVICE
        )
    }

    async buyAnimal(request: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        try {
            const walletRequest: GoldRequest = {
                userId: request.userId,
                goldAmount: 99
            }
            // const response = await lastValueFrom(this.GoldWalletService.addGold(walletRequest))

            return {
                placedItemAnimalKey: "1234"
            }
        } catch (error) {
            console.error("Error updating wallet:", error)
            throw error
        }
    }
}

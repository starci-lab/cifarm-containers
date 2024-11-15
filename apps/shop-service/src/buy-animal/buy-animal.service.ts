import { goldWalletGrpcConstants } from "@apps/wallet-service/src/constants"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { IGoldWalletService } from "@src/containers/wallet-service"
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
            return {
                placedItemAnimalKey: "1234"
            }
        } catch (error) {
            console.error("Error updating wallet:", error)
            throw error
        }
    }
}

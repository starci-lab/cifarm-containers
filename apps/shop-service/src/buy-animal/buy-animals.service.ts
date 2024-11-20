import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { IWalletService } from "@src/containers/wallet-service"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animals.dto"

@Injectable()
export class BuyAnimalsService {
    private readonly logger = new Logger(BuyAnimalsService.name)
    private walletService: IWalletService
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>(walletGrpcConstants.SERVICE)
    }

    async buyAnimals(request: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        try {
            return
        } catch (error) {
            console.error("Error updating wallet:", error)
            throw error
        }
    }
}

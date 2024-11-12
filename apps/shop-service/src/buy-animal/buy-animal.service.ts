import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientGrpc } from "@nestjs/microservices"
import { Cache } from "cache-manager"
import { lastValueFrom, Observable } from "rxjs"
import { DataSource } from "typeorm"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"
import { IWalletService } from "@src/services/wallet"
import { GoldRequest } from "@apps/wallet-service/src/update-wallet"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)
    private walletService: IWalletService
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc,
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>("WalletService")
    }

    async buyAnimal(request: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        try {
            const walletRequest: GoldRequest = {
                userId: request.userId,
                goldAmount: 99, 
            }
            // const response = await lastValueFrom(this.walletService.addGold(walletRequest))
            
            return {
                placedItemAnimalKey: "1234",
            }
        } catch (error) {
            console.error("Error updating wallet:", error)
            throw error
        }
    }
}

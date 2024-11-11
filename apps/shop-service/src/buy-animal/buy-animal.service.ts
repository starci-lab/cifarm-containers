import { Inject, Injectable, Logger } from "@nestjs/common"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"
import { DataSource } from "typeorm"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Cache } from "cache-manager"
import { UpdateWalletRequest, UpdateWalletResponse } from "@apps/wallet-service/src/update-wallet"
import { lastValueFrom, Observable } from "rxjs"
import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { ClientGrpc } from "@nestjs/microservices"

interface IWalletService {
    updateWallet(data: UpdateWalletRequest): Observable<UpdateWalletResponse>;
}

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)
    private walletService: IWalletService;
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        @Inject(walletGrpcConstants.NAME) private client: ClientGrpc,
    ) {}

    onModuleInit() {
        this.walletService = this.client.getService<IWalletService>("WalletService");
    }

    async buyAnimal(request: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        try {
            const walletRequest: UpdateWalletRequest = {
                userId: request.userId,
                goldAmount: 99, 
                tokenAmount: 29, // if applicable
            }
            const response = await lastValueFrom(this.walletService.updateWallet(walletRequest))
            return {
                placedItemAnimalKey: "1234",
            }
        } catch (error) {
            console.error("Error updating wallet:", error)
            throw error
        }
    }
}

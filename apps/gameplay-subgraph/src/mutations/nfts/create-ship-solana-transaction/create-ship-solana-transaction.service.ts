import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { CreateShipSolanaTransactionResponse } from "./create-ship-solana-transaction.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { NFTDatabaseService } from "@src/blockchain-database"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { ShipService } from "@src/gameplay"

@Injectable()
export class CreateShipSolanaTransactionService {
    private readonly logger = new Logger(CreateShipSolanaTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService,
        private readonly nftDatabaseService: NFTDatabaseService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service,
        private readonly shipService: ShipService   
    ) {}

    async createShipSolanaTransaction({
        id
    }: UserLike): Promise<CreateShipSolanaTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const { inventoryMap} = await this.shipService.partitionInventories({
                    userId: id,
                    session
                })
                console.log(inventoryMap)
            })
            return {
                success: true,
                message: "NFT starter box purchased successfully",
                data: {
                    serializedTx: ""
                }
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}

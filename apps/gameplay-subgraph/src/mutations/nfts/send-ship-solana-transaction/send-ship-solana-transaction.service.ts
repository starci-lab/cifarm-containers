import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { SendShipSolanaTransactionResponse } from "./send-ship-solana-transaction.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { NFTDatabaseService } from "@src/blockchain-database"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { ShipService } from "@src/gameplay"

@Injectable()
export class SendShipSolanaTransactionService {
    private readonly logger = new Logger(SendShipSolanaTransactionService.name)
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

    async sendShipSolanaTransaction({
        id
    }: UserLike): Promise<SendShipSolanaTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const inventoryMap = await this.shipService.partitionInventories({
                    userId: id,
                    session
                })
                console.log(inventoryMap)
            })
            return {
                success: true,
                message: "NFT starter box purchased successfully",
                data: {
                    txHash: ""
                }
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}

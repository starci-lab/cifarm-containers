import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    GoldPurchaseOption
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import {
    SendBuyGoldsSolanaTransactionRequest,
    SendBuyGoldsSolanaTransactionResponse
} from "./send-buy-golds-solana-transaction.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import base58 from "bs58"
import { BuyGoldsSolanaTransactionCache } from "@src/cache"

@Injectable()
export class SendBuyGoldsSolanaTransactionService {
    private readonly logger = new Logger(SendBuyGoldsSolanaTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService,
        private readonly goldBalanceService: GoldBalanceService,    
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service,
    ) {}

    async sendBuyGoldsSolanaTransaction(
        { id }: UserLike,
        { serializedTx }: SendBuyGoldsSolanaTransactionRequest
    ): Promise<SendBuyGoldsSolanaTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // get the user
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new Error("User not found")
                }
                const tx = this.solanaMetaplexService
                    .getUmi(user.network)
                    .transactions.deserialize(base58.decode(serializedTx))
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaMetaplexService
                            .getUmi(user.network)
                            .transactions.serializeMessage(tx.message)
                    )
                )
                const cachedTx = await this.cacheManager.get<BuyGoldsSolanaTransactionCache>(cacheKey)
                if (!cachedTx) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const { selectionIndex } = cachedTx
                const option = this.staticService.goldPurchases[user.chainKey][user.network].options[selectionIndex] as GoldPurchaseOption
                if (!option) {
                    throw new GraphQLError("Invalid selection index", {
                        extensions: {
                            code: "INVALID_SELECTION_INDEX"
                        }
                    })
                }
                const { amount } = option
                // add the amount to the user's gold balance
                this.goldBalanceService.add({
                    user,
                    amount,
                })
                await user.save({ session })

                const signedTx = await this.solanaMetaplexService
                    .getUmi(user.network)
                    .identity.signTransaction(tx)
                const txHash = await this.solanaMetaplexService
                    .getUmi(user.network)
                    .rpc.sendTransaction(signedTx)
                const latestBlockhash = await this.solanaMetaplexService
                    .getUmi(user.network)
                    .rpc.getLatestBlockhash()
                await this.solanaMetaplexService
                    .getUmi(user.network)
                    .rpc.confirmTransaction(txHash, {
                        commitment: "finalized",
                        strategy: {
                            type: "blockhash",
                            blockhash: latestBlockhash.blockhash,
                            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                        }
                    })
                return {
                    success: true,
                    message: "Ship Solana transaction sent successfully",
                    data: {
                        txHash: base58.encode(txHash)
                    }
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

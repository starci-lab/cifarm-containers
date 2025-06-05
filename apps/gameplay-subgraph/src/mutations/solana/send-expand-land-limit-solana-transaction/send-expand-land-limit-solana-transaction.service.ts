import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    GoldPurchaseOption
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import {
    SendExpandLandLimitSolanaTransactionRequest,
    SendExpandLandLimitSolanaTransactionResponse
} from "./send-expand-land-limit-solana-transaction.dto"
import { SolanaService } from "@src/blockchain"
import { GoldBalanceService, StaticService, SyncService } from "@src/gameplay"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import base58 from "bs58"
import { CreateExpandLandLimitSolanaTransactionCache } from "@src/cache"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class SendExpandLandLimitSolanaTransactionService {
    private readonly logger = new Logger(SendExpandLandLimitSolanaTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly staticService: StaticService,
        private readonly goldBalanceService: GoldBalanceService,  
        @InjectKafkaProducer()  
        private readonly kafkaProducer: Producer,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service,
        private readonly syncService: SyncService
    ) {}

    async sendExpandLandLimitSolanaTransaction(
        { id }: UserLike,
        { serializedTx }: SendExpandLandLimitSolanaTransactionRequest
    ): Promise<SendExpandLandLimitSolanaTransactionResponse> {
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
                const tx = this.solanaService
                    .getUmi(user.network)
                    .transactions.deserialize(base58.decode(serializedTx))
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaService
                            .getUmi(user.network)
                            .transactions.serializeMessage(tx.message)
                    )
                )
                const cachedTx = await this.cacheManager.get<CreateExpandLandLimitSolanaTransactionCache>(cacheKey)
                if (!cachedTx) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const { selectionIndex } = cachedTx
                const option = this.staticService.goldPurchases[user.network].options[selectionIndex] as GoldPurchaseOption
                if (!option) {
                    throw new GraphQLError("Invalid selection index", {
                        extensions: {
                            code: "INVALID_SELECTION_INDEX"
                        }
                    })
                }
                const userSnapshot = user.$clone()
                // send the land limit for user
                if (
                    selectionIndex < user.landLimitIndex
                ) {
                    throw new GraphQLError("Invalid selection index", {
                        extensions: {
                            code: "INVALID_SELECTION_INDEX"
                        }
                    })
                }
                user.landLimitIndex = selectionIndex
                await user.save({ session })
                // const signedTx = await this.solanaService
                //     .getUmi(user.network)
                //     .identity.signTransaction(tx)
                const txHash = await this.solanaService
                    .getUmi(user.network)
                    .rpc.sendTransaction(tx)
                const latestBlockhash = await this.solanaService
                    .getUmi(user.network)
                    .rpc.getLatestBlockhash()
                await this.solanaService
                    .getUmi(user.network)
                    .rpc.confirmTransaction(txHash, {
                        commitment: "finalized",
                        strategy: {
                            type: "blockhash",
                            blockhash: latestBlockhash.blockhash,
                            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                        }
                    })
                const data = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })
                await this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        {
                            value: JSON.stringify({
                                userId: user.id,
                                data
                            })
                        }
                    ]
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

import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    SendConvertSolanaMetaplexNFTsTransactionResponse,
    SendConvertSolanaMetaplexNFTsTransactionRequest
} from "./send-convert-metaplex-solana-nfts-transaction.dto"
import { SolanaService } from "@src/blockchain"
import base58 from "bs58"
import { InjectCache, ConvertSolanaMetaplexNFTsTransactionCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { Transaction, TransactionSignature } from "@metaplex-foundation/umi"

@Injectable()
export class SendConvertSolanaMetaplexNFTsTransactionService {
    private readonly logger = new Logger(SendConvertSolanaMetaplexNFTsTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async sendConvertSolanaMetaplexNFTsTransaction(
        { id }: UserLike,
        { serializedTxs }: SendConvertSolanaMetaplexNFTsTransactionRequest
    ): Promise<SendConvertSolanaMetaplexNFTsTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new GraphQLError("User not found")
                }
                const cacheKeys: Array<string> = []
                const txs: Array<Transaction> = []
                for (const serializedTx of serializedTxs) {
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
                    cacheKeys.push(cacheKey)
                    txs.push(tx)
                }
                const finalCacheKey = this.sha256Service.hash(cacheKeys.join(""))
                const cachedTx = await this.cacheManager.get<ConvertSolanaMetaplexNFTsTransactionCache>(finalCacheKey)
                if (!cachedTx) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const { convertedNFTs, network } = cachedTx
                const txHashes: Array<TransactionSignature> = []
                await Promise.any(txs.map(async (tx) => {
                    const signedTx = await this.solanaService
                        .getUmi(network)
                        .identity.signTransaction(tx)
                    // send the transactions
                    const txHash = await this.solanaService
                        .getUmi(network)
                        .rpc.sendTransaction(signedTx)
                    txHashes.push(txHash)
                    return signedTx
                }))
                const txHash = txHashes[0]
                const latestBlockhash = await this.solanaService
                    .getUmi(network)
                    .rpc.getLatestBlockhash()
                await this.solanaService
                    .getUmi(network)
                    .rpc.confirmTransaction(txHash, {
                        commitment: "finalized",
                        strategy: {
                            type: "blockhash",
                            blockhash: latestBlockhash.blockhash,
                            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                        }
                    })
                return {
                    data: {
                        txHash: base58.encode(txHash),
                        convertedNFTs
                    },
                    success: true,
                    message: "NFT starter box transaction sent successfully"
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

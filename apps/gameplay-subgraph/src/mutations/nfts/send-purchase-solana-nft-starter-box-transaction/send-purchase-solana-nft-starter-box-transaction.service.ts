import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    SendPurchaseSolanaNFTStarterBoxTransactionResponse,
    SendPurchaseSolanaNFTStarterBoxTransactionRequest
} from "./send-purchase-solana-nft-starter-box-transaction.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import base58 from "bs58"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"

@Injectable()
export class SendPurchaseSolanaNFTStarterBoxTransactionService {
    private readonly logger = new Logger(SendPurchaseSolanaNFTStarterBoxTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async sendPurchaseSolanaNFTStarterBoxTransaction(
        { id }: UserLike,
        { serializedTx }: SendPurchaseSolanaNFTStarterBoxTransactionRequest
    ): Promise<SendPurchaseSolanaNFTStarterBoxTransactionResponse> {
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
                user.lastSolanaNFTStarterBoxRollRarity = undefined
                user.lastSolanaStarterBoxRollType = undefined
                await user.save({ session })
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
                const cachedTx = await this.cacheManager.get(cacheKey)
                if (!cachedTx) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const signedTx = await this.solanaMetaplexService
                    .getUmi(user.network)
                    .identity.signTransaction(tx)
                //console.log(signedTx.signatures.length)
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

                await this.cacheManager.del(cacheKey)
                return { txHash: base58.encode(txHash) }
            })
            return {
                success: true,
                message: "NFT starter box transaction sent successfully",
                data: result
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}

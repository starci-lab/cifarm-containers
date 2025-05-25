import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, KeyValueRecord, KeyValueStoreId, KeyValueStoreSchema, VaultInfos } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    SendPurchaseSolanaNFTBoxesTransactionResponse,
    SendPurchaseSolanaNFTBoxesTransactionRequest
} from "./send-purchase-solana-nft-boxes-transaction.dto"
import { SolanaService } from "@src/blockchain"
import base58 from "bs58"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { createObjectId } from "@src/common"
import { PurchaseSolanaNFTBoxTransactionCache } from "@src/cache"
import { Transaction, TransactionSignature } from "@metaplex-foundation/umi"

@Injectable()
export class SendPurchaseSolanaNFTBoxesTransactionService {
    private readonly logger = new Logger(SendPurchaseSolanaNFTBoxesTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async sendPurchaseSolanaNFTBoxesTransaction(
        { id }: UserLike,
        { serializedTxs }: SendPurchaseSolanaNFTBoxesTransactionRequest
    ): Promise<SendPurchaseSolanaNFTBoxesTransactionResponse> {
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
                user.nftBoxVector = undefined
                await user.save({ session })
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
                const cachedTx = await this.cacheManager.get<PurchaseSolanaNFTBoxTransactionCache>(finalCacheKey)
                if (!cachedTx) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const { nftBoxes, tokenAmount, network } = cachedTx

                // first season is USDC so that we hardcode the token address
                // update the valut info in the database
                const vaultInfos = await this.connection
                    .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                    .findById<
                        KeyValueRecord<VaultInfos>
                    >(createObjectId(KeyValueStoreId.VaultInfos))
                    .session(session)
                if (!vaultInfos) {
                    throw new GraphQLError("Vault infos not found")
                }
                await this.connection
                    .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                    .updateOne(
                        {
                            _id: createObjectId(KeyValueStoreId.VaultInfos)
                        },
                        {
                            value: {
                                [network]: {
                                    tokenLocked:
                                        vaultInfos.value[network]
                                            .tokenLocked +
                                            tokenAmount
                                }
                            }
                        }
                    )
                    .session(session)
                //console.log(signedTx.signatures.length)
                // sign the transactions
                const txHashes: Array<TransactionSignature> = []
                await Promise.all(txs.map(async (tx) => {
                    const signedTx = await this.solanaService
                        .getUmi(network)
                        .identity.signTransaction(tx)
                    // send the transactions
                    const txHash = await this.solanaService
                        .getUmi(network)
                        .rpc.sendTransaction(signedTx)
                    txHashes.push(txHash)
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
                }))
                const txHash = txHashes.at(-1)
                return {
                    data: {
                        txHash: base58.encode(txHash),
                        nftBoxes
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

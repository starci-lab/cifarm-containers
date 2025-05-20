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
import { SolanaMetaplexService } from "@src/blockchain"
import base58 from "bs58"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { createObjectId } from "@src/common"
import { PurchaseSolanaNFTBoxTransactionCache } from "@src/cache"

@Injectable()
export class SendPurchaseSolanaNFTBoxesTransactionService {
    private readonly logger = new Logger(SendPurchaseSolanaNFTBoxesTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async sendPurchaseSolanaNFTBoxesTransaction(
        { id }: UserLike,
        { serializedTx }: SendPurchaseSolanaNFTBoxesTransactionRequest
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
                const cachedTx = await this.cacheManager.get<PurchaseSolanaNFTBoxTransactionCache>(cacheKey)
                if (!cachedTx) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const { nftBoxes, chainKey, tokenAmount, network } = cachedTx
                const signedTx = await this.solanaMetaplexService
                    .getUmi(network)
                    .identity.signTransaction(tx)
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
                                [chainKey]: {
                                    [network]: {
                                        tokenLocked:
                                            vaultInfos.value[chainKey][network]
                                                .tokenLocked +
                                            tokenAmount
                                    }
                                }
                            }
                        }
                    )
                    .session(session)
                //console.log(signedTx.signatures.length)
                const txHash = await this.solanaMetaplexService
                    .getUmi(network)
                    .rpc.sendTransaction(signedTx)
                const latestBlockhash = await this.solanaMetaplexService
                    .getUmi(network)
                    .rpc.getLatestBlockhash()
                await this.solanaMetaplexService
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

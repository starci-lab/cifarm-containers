import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import {
    CreateUnwrapSolanaMetaplexNFTTransactionRequest,
    CreateUnwrapSolanaMetaplexNFTTransactionResponse
} from "./create-unwrap-solana-metaplex-nft-transaction.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { GraphQLError } from "graphql"
import { UserSchema } from "@src/databases"
import base58 from "bs58"
import { Sha256Service } from "@src/crypto"
import { publicKey, createNoopSigner, transactionBuilder } from "@metaplex-foundation/umi"
import { InjectCache, UnwrapSolanaMetaplexNFTTransactionCache } from "@src/cache"
import { Cache } from "cache-manager"

@Injectable()
export class CreateUnwrapSolanaMetaplexNFTTransactionService {
    private readonly logger = new Logger(CreateUnwrapSolanaMetaplexNFTTransactionService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly sha256Service: Sha256Service,
        @InjectCache()
        private readonly cacheManager: Cache
    ) {}

    async createUnwrapSolanaMetaplexNFTTransaction(
        { id }: UserLike,
        { nftAddress, collectionAddress }: CreateUnwrapSolanaMetaplexNFTTransactionRequest
    ): Promise<CreateUnwrapSolanaMetaplexNFTTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                // Get NFT from blockchain
                const nft = await this.solanaMetaplexService.getNFT({
                    nftAddress,
                    network: user.network
                })
                if (!nft) {
                    throw new GraphQLError("NFT not found on blockchain", {
                        extensions: {
                            code: "NFT_NOT_FOUND_ON_BLOCKCHAIN"
                        }
                    })
                }

                if (!nft.permanentFreezeDelegate.frozen) {
                    throw new GraphQLError("NFT is not frozen", {
                        extensions: {
                            code: "NFT_NOT_FROZEN"
                        }
                    })
                }

                // Create unfreeze transaction
                let builder = transactionBuilder()
                const { transaction: unfreezeTransaction } =
                    await this.solanaMetaplexService.createUnfreezeNFTTransaction({
                        nftAddress,
                        collectionAddress,
                        network: user.network,
                        feePayer: user.accountAddress
                    })
                builder = builder.add(unfreezeTransaction)

                const transaction = await builder
                    .useV0()
                    .setFeePayer(createNoopSigner(publicKey(user.accountAddress)))
                    .buildAndSign(this.solanaMetaplexService.getUmi(user.network))

                // Store transaction in cache
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaMetaplexService
                            .getUmi(user.network)
                            .transactions.serializeMessage(transaction.message)
                    )
                )

                const cacheData: UnwrapSolanaMetaplexNFTTransactionCache = {
                    nftAddress,
                    collectionAddress
                }

                await this.cacheManager.set(cacheKey, cacheData, 1000 * 60 * 15) // 15 minutes

                return {
                    data: {
                        serializedTx: base58.encode(
                            this.solanaMetaplexService
                                .getUmi(user.network)
                                .transactions.serialize(transaction)
                        )
                    },
                    success: true,
                    message: "Unwrap Solana Metaplex NFT Transaction created successfully"
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

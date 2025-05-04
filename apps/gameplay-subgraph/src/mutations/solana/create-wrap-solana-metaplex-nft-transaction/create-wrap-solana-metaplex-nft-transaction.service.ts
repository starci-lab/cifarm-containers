import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    NFTMetadataSchema,
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { CreateWrapSolanaMetaplexNFTTransactionRequest, CreateWrapSolanaMetaplexNFTTransactionResponse } from "./create-wrap-solana-metaplex-nft-transaction.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { GraphQLError } from "graphql"
import { UserSchema } from "@src/databases"
import base58 from "bs58"
import { Sha256Service } from "@src/crypto"
import { publicKey, createNoopSigner, transactionBuilder } from "@metaplex-foundation/umi"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { WrapSolanaMetaplexNFTTransactionCache } from "@src/cache"

@Injectable()
export class CreateWrapSolanaMetaplexNFTTransactionService {
    private readonly logger = new Logger(CreateWrapSolanaMetaplexNFTTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly sha256Service: Sha256Service,
        @InjectCache()
        private readonly cacheManager: Cache
    ) {}

    async createWrapSolanaMetaplexNFTTransaction({
        id
    }: UserLike, {
        nftAddress,
        collectionAddress
    }: CreateWrapSolanaMetaplexNFTTransactionRequest): Promise<CreateWrapSolanaMetaplexNFTTransactionResponse> {
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
                const { network, accountAddress } = user
                const nft = await this.solanaMetaplexService.getNFT({
                    nftAddress,
                    network
                })
                if (!nft) {
                    throw new GraphQLError("NFT not found", {
                        extensions: {
                            code: "NFT_NOT_FOUND"
                        }
                    })
                }
                if (nft.permanentFreezeDelegate.frozen) {
                    throw new GraphQLError("NFT is already frozen", {
                        extensions: {
                            code: "NFT_ALREADY_FROZEN"
                        }
                    })
                }
                if (nft.owner !== accountAddress) {
                    throw new GraphQLError("You are not the owner of this NFT", {
                        extensions: {
                            code: "NOT_OWNER"
                        }
                    })
                }
                let builder = transactionBuilder()
                // create a versionel transaction to free the nft from the collection
                const { transaction: freezeTransaction } = await this.solanaMetaplexService.createFreezeNFTTransaction({
                    nftAddress,
                    collectionAddress,
                    network,
                    feePayer: accountAddress
                })
                
                builder = builder.add(freezeTransaction)
                const transaction = await builder
                    .useV0()
                    .setFeePayer(createNoopSigner(publicKey(user.accountAddress)))
                    .buildAndSign(this.solanaMetaplexService.getUmi(user.network))
                // create a nft metadata to track the nft status
                // recall the validate to set the frozen status to true
                let foundNFTMetadata = await this.connection
                    .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                    .findOne({
                        nftAddress,
                        collectionAddress,
                        user: id
                    }).session(session)
                if (!foundNFTMetadata) {
                    const [nftMetadata] = await this.connection
                        .model<NFTMetadataSchema>(NFTMetadataSchema.name)
                        .create([{
                            nftAddress,
                            collectionAddress,
                            user: id,
                            validated: false,
                            nftName: nft.name,
                        }], { session })
                    foundNFTMetadata = nftMetadata
                }
                // store the transaction in the cache
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaMetaplexService
                            .getUmi(user.network)
                            .transactions.serializeMessage(transaction.message)
                    )
                )     
                const cacheData: WrapSolanaMetaplexNFTTransactionCache = {
                    nftMetadataId: foundNFTMetadata._id.toString(),
                }
                await this.cacheManager.set(cacheKey, cacheData, 1000 * 60 * 15) // 15 minutes
                return {
                    message: "NFT frozen transaction created",
                    success: true,
                    data: {
                        serializedTx: base58.encode(
                            this.solanaMetaplexService
                                .getUmi(user.network)
                                .transactions.serialize(transaction)
                        )
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

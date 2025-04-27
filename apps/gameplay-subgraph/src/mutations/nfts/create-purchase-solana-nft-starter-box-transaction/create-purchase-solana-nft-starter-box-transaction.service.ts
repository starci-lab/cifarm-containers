import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTCollectionData, NFTRarity, StableCoinName } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import { CreatePurchaseSolanaNFTStarterBoxTransactionResponse } from "./create-purchase-solana-nft-starter-box-transaction.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { transactionBuilder, publicKey, createNoopSigner } from "@metaplex-foundation/umi"
import base58 from "bs58"
import { NFTDatabaseService } from "@src/blockchain-database"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
@Injectable()
export class CreatePurchaseSolanaNFTStarterBoxTransactionService {
    private readonly logger = new Logger(CreatePurchaseSolanaNFTStarterBoxTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService,
        private readonly nftDatabaseService: NFTDatabaseService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async createPurchaseSolanaNFTStarterBoxTransaction({
        id
    }: UserLike): Promise<CreatePurchaseSolanaNFTStarterBoxTransactionResponse> {
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

                const isStarterBoxUnset = !(
                    user.lastSolanaNFTStarterBoxRollRarity && user.lastSolanaStarterBoxRollType
                )
                if (isStarterBoxUnset) {
                    user.lastSolanaNFTStarterBoxRollRarity = Math.random()
                    user.lastSolanaStarterBoxRollType = Math.random()
                    await user.save({ session })
                }

                const nftStarterBoxInfo = this.staticService.nftStarterBoxInfo
                if (!nftStarterBoxInfo) {
                    throw new GraphQLError("NFT starter box info not found")
                }
                const nftStarterBoxChances = nftStarterBoxInfo.chances
                const nftStarterBoxChance = nftStarterBoxChances.find((chance) => {
                    return (
                        user.lastSolanaNFTStarterBoxRollRarity >= chance.startChance &&
                        user.lastSolanaNFTStarterBoxRollRarity < chance.endChance
                    )
                })
                if (!nftStarterBoxChance) {
                    throw new GraphQLError("NFT starter box chance not found")
                }
                let rarity: NFTRarity
                if (user.lastSolanaStarterBoxRollType < nftStarterBoxChance.rareRarityChance) {
                    rarity = NFTRarity.Rare
                } else if (
                    user.lastSolanaStarterBoxRollType < nftStarterBoxChance.epicRarityChance
                ) {
                    rarity = NFTRarity.Epic
                } else {
                    rarity = NFTRarity.Common
                }
                const { nftType } = nftStarterBoxChance
                const nftCollectionData = this.staticService.nftCollections[nftType][user.chainKey][
                    user.network
                ] as NFTCollectionData

                let builder = transactionBuilder()
                // all nft has a rarity normal for equally distributed
                const nextNFTIndex = await this.nftDatabaseService.getNextNFTIndex({
                    network: user.network,
                    chainKey: user.chainKey,
                    collectionAddress: nftCollectionData.collectionAddress,
                    session,
                    save: !isStarterBoxUnset
                })

                const { transaction: mintNFTTransaction } =
                    await this.solanaMetaplexService.createMintNFTTransaction({
                        network: user.network,
                        ownerAddress: user.accountAddress,
                        attributes: Object.entries(nftCollectionData.rarities[rarity]).map(
                            ([key, value]) => ({
                                key,
                                value
                            })
                        ),
                        collectionAddress: nftCollectionData.collectionAddress,
                        name: `${nftCollectionData.name} #${nextNFTIndex}`,
                        feePayer: user.accountAddress,
                        uri: nftCollectionData.fruitStages.stages[0].imageUrl
                    })

                builder = builder.add(mintNFTTransaction)
                //get the stable coin address
                const { address: stableCoinAddress, decimals: stableCoinDecimals } =
                    this.staticService.stableCoins[StableCoinName.USDC][user.chainKey][user.network]

                const tokenVaultAddress =
                    this.staticService.tokenVaults[user.chainKey][user.network].address
                const { transaction: transferStableCoinTransaction } =
                    await this.solanaMetaplexService.createTransferTokenTransaction({
                        network: user.network,
                        tokenAddress: stableCoinAddress,
                        toAddress: tokenVaultAddress,
                        amount: nftStarterBoxInfo.boxPrice,
                        decimals: stableCoinDecimals,
                        fromAddress: user.accountAddress
                    })
                // add to the transaction
                builder = builder.add(transferStableCoinTransaction)
                const transaction = await builder
                    .useV0()
                    .setFeePayer(createNoopSigner(publicKey(user.accountAddress)))
                    .buildAndSign(this.solanaMetaplexService.getUmi(user.network))
                // store the transaction in the cache
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaMetaplexService
                            .getUmi(user.network)
                            .transactions.serializeMessage(transaction.message)
                    )
                )
                await this.cacheManager.set(cacheKey, true, 1000 * 15)
                return base58.encode(
                    this.solanaMetaplexService
                        .getUmi(user.network)
                        .transactions.serialize(transaction)
                )
            })
            return {
                success: true,
                message: "NFT starter box purchased successfully",
                data: {
                    serializedTx: result
                }
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}

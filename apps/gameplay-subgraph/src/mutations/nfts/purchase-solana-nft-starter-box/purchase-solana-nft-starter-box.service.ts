import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTCollectionData, NFTRarity, StableCoinName } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import { PurchaseSolanaNFTStarterBoxResponse } from "./purchase-solana-nft-starter-box.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { transactionBuilder, publicKey, createNoopSigner } from "@metaplex-foundation/umi"
import base58 from "bs58"
import { NFTDatabaseService } from "@src/blockchain-database"

@Injectable()
export class PurchaseSolanaNFTStarterBoxService {
    private readonly logger = new Logger(PurchaseSolanaNFTStarterBoxService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService,
        private readonly nftDatabaseService: NFTDatabaseService
    ) {}
    async purchaseSolanaNFTStarterBox({
        id
    }: UserLike): Promise<PurchaseSolanaNFTStarterBoxResponse> {
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

                let firstTxOrDonePreviousTx = true
                const lastSolanaNFTAddress = user.lastSolanaNFTAddress
                if (lastSolanaNFTAddress) {
                    const nft = await this.solanaMetaplexService.getNFT({ network: user.network, nftAddress: lastSolanaNFTAddress })
                    if (nft) {
                        user.lastSolanaNFTAddress = undefined
                        user.lastSolanaNFTStarterBoxRollRarity = undefined
                        user.lastSolanaStarterBoxRollType = undefined
                        firstTxOrDonePreviousTx = true
                    }
                    firstTxOrDonePreviousTx = false
                }
                user.lastSolanaNFTStarterBoxRollRarity = user.lastSolanaNFTStarterBoxRollRarity || Math.random()    
                user.lastSolanaStarterBoxRollType = user.lastSolanaStarterBoxRollType || Math.random()

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
                } else if (user.lastSolanaStarterBoxRollType < nftStarterBoxChance.epicRarityChance) {
                    rarity = NFTRarity.Epic
                } else {
                    rarity = NFTRarity.Common
                }
                const { nftType } = nftStarterBoxChance
                const nftCollectionData =
                    this.staticService.nftCollections[nftType][user.chainKey][user.network] as NFTCollectionData

                let builder = transactionBuilder()
                // all nft has a rarity normal for equally distributed
                const nextNFTIndex = await this.nftDatabaseService.getNextNFTIndex({
                    network: user.network,
                    chainKey: user.chainKey,
                    collectionAddress: nftCollectionData.collectionAddress,
                    session,
                    save: firstTxOrDonePreviousTx
                })

                const { transaction: mintNFTTransaction, nftAddress } =
                    await this.solanaMetaplexService.createMintNFTTransaction({
                        network: user.network,
                        ownerAddress: user.accountAddress,
                        attributes: Object.values(nftCollectionData.rarities[rarity]),
                        collectionAddress: nftCollectionData.collectionAddress,
                        name: `${nftCollectionData.name} #${nextNFTIndex}`,
                        feePayer: user.accountAddress,
                        uri: nftCollectionData.fruitStages.stages[0].imageUrl
                    })
                user.lastSolanaNFTAddress = nftAddress
                
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
                    .setBlockhash(await this.solanaMetaplexService.getUmi(user.network).rpc.getLatestBlockhash())
                    .buildAndSign(this.solanaMetaplexService.getUmi(user.network))

                if (firstTxOrDonePreviousTx) {
                    await user.save({ session })
                }  
                return base58.encode(this.solanaMetaplexService.getUmi(user.network).transactions.serialize(transaction))   
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

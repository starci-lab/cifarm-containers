import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, NFTRarity, StableCoinName } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import { PurchaseSolanaNFTStarterBoxResponse } from "./purchase-solana-nft-starter-box.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { transactionBuilder, publicKey, createNoopSigner } from "@metaplex-foundation/umi"
import base58 from "bs58"

@Injectable()
export class PurchaseSolanaNFTStarterBoxService {
    private readonly logger = new Logger(PurchaseSolanaNFTStarterBoxService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaMetaplexService: SolanaMetaplexService,
        private readonly staticService: StaticService
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
                if (user.lastNFTStarterBoxRollRarity === undefined) {
                    user.lastNFTStarterBoxRollRarity = Math.random()
                }
                const lastNFTStarterBoxRollRarity = user.lastNFTStarterBoxRollRarity
                const nftStarterBoxInfo = this.staticService.nftStarterBoxInfo
                if (!nftStarterBoxInfo) {
                    throw new GraphQLError("NFT starter box info not found")
                }
                const nftStarterBoxChances = nftStarterBoxInfo.chances
                const nftStarterBoxChance = nftStarterBoxChances.find((chance) => {
                    return (
                        lastNFTStarterBoxRollRarity >= chance.startChance &&
                        lastNFTStarterBoxRollRarity < chance.endChance
                    )
                })
                if (!nftStarterBoxChance) {
                    throw new GraphQLError("NFT starter box chance not found")
                }
                const { nftType } = nftStarterBoxChance
                const nftInfo =
                    this.staticService.nftCollections[nftType][user.chainKey][user.network]
                let builder = transactionBuilder()
                // all nft has a rarity normal for equally distributed
                const { transaction: mintNFTTransaction } =
                    await this.solanaMetaplexService.createMintNFTTransaction({
                        network: user.network,
                        ownerAddress: user.accountAddress,
                        attributes: Object.values(nftInfo.rarities[NFTRarity.Common]),
                        collectionAddress: nftInfo.collectionAddress,
                        name: "example",
                        feePayer: user.accountAddress,
                        uri: "example"
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
                    .setBlockhash(await this.solanaMetaplexService.getUmi(user.network).rpc.getLatestBlockhash())
                    .buildAndSign(this.solanaMetaplexService.getUmi(user.network))
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

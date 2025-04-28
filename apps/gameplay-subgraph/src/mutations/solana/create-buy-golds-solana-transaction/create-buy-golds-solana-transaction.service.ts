import { Injectable, Logger } from "@nestjs/common"
import { GoldPurchaseOption, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    CreateBuyGoldsSolanaTransactionRequest,
    CreateBuyGoldsSolanaTransactionResponse
} from "./create-buy-golds-solana-transaction.dto"
import { SolanaMetaplexService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { transactionBuilder, publicKey, createNoopSigner } from "@metaplex-foundation/umi"
import base58 from "bs58"
import { NFTDatabaseService } from "@src/blockchain-database"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { BuyGoldsSolanaTransactionCache } from "@src/cache"

@Injectable()
export class CreateBuyGoldsSolanaTransactionService {
    private readonly logger = new Logger(CreateBuyGoldsSolanaTransactionService.name)
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

    async createBuyGoldsSolanaTransaction(
        { id }: UserLike,
        { selectionIndex }: CreateBuyGoldsSolanaTransactionRequest
    ): Promise<CreateBuyGoldsSolanaTransactionResponse> {
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
                const option =
                    this.staticService.goldPurchases[user.chainKey][user.network].options[
                        selectionIndex
                    ] as GoldPurchaseOption
                if (!option) {
                    throw new GraphQLError("Invalid selection index")
                }
                const { price, paymentKind } = option
                const { tokenAddress, decimals } = this.staticService.getTokenAddressFromPaymentKind({
                    paymentKind,
                    network: user.network,
                    chainKey: user.chainKey
                })
                // create a transaction to buy the golds
                let builder = transactionBuilder()
                const feeReceiverAddress = this.staticService.feeReceivers[user.chainKey][user.network].address
                const { transaction: transferTokenTransaction } =
                    await this.solanaMetaplexService.createTransferTokenTransaction({
                        network: user.network,
                        tokenAddress,
                        toAddress: feeReceiverAddress,
                        amount: price,
                        decimals,
                        fromAddress: user.accountAddress
                    })
                builder = builder.add(transferTokenTransaction)
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

                const cacheData: BuyGoldsSolanaTransactionCache = {
                    selectionIndex
                }
                await this.cacheManager.set(cacheKey, cacheData, 1000 * 60 * 15) // 15 minutes to verify the transaction
                return {
                    serializedTx: base58.encode(
                        this.solanaMetaplexService
                            .getUmi(user.network)
                            .transactions.serialize(transaction)
                    )
                }
            })
            return {
                success: true,
                message: "Golds purchased transaction created successfully",
                data: result
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

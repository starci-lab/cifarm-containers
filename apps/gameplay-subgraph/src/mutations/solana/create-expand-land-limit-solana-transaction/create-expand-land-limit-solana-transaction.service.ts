import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    CreateExpandLandLimitSolanaTransactionRequest,
    CreateExpandLandLimitSolanaTransactionResponse
} from "./create-expand-land-limit-solana-transaction.dto"
import { SolanaService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { transactionBuilder, publicKey, createNoopSigner } from "@metaplex-foundation/umi"
import base58 from "bs58"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { ChainKey } from "@src/env"
import { CreateExpandLandLimitSolanaTransactionCache } from "@src/cache"
@Injectable()
export class CreateExpandLandLimitSolanaTransactionService {
    private readonly logger = new Logger(CreateExpandLandLimitSolanaTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly staticService: StaticService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async createExpandLandLimitSolanaTransaction(
        { id }: UserLike,
        { selectionIndex, accountAddress }: CreateExpandLandLimitSolanaTransactionRequest
    ): Promise<CreateExpandLandLimitSolanaTransactionResponse> {
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
                const limit =
                    this.staticService.landLimitInfo.landLimits.find(
                        (limit) => limit.index === user.landLimitIndex
                    )
                if (!limit) {
                    throw new GraphQLError("Invalid selection index")
                }
                const { price, tokenKey } = limit
                const { tokenAddress, decimals } = this.staticService.tokens[tokenKey][ChainKey.Solana][user.network]
                // create a transaction to buy the golds
                const { limitTransaction, priceTransaction } =
                    await this.solanaService.createComputeBudgetTransactions({
                        network: user.network
                    })
                let builder = transactionBuilder().add(limitTransaction).add(priceTransaction)
                const revenueRecipientAddress = this.staticService.revenueRecipients[user.network].address
                const { transaction: transferTokenTransaction } =
                    await this.solanaService.createTransferTokenTransaction({
                        network: user.network,
                        tokenAddress,
                        toAddress: revenueRecipientAddress,
                        amount: price,
                        decimals,
                        fromAddress: accountAddress
                    })
                builder = builder.add(transferTokenTransaction)
                const transaction = await builder
                    .useV0()
                    .setFeePayer(createNoopSigner(publicKey(accountAddress)))
                    .buildAndSign(this.solanaService.getUmi(user.network))
                // store the transaction in the cache
                const cacheKey = this.sha256Service.hash(
                    base58.encode(
                        this.solanaService
                            .getUmi(user.network)
                            .transactions.serializeMessage(transaction.message)
                    )
                )

                const cacheData: CreateExpandLandLimitSolanaTransactionCache = {
                    selectionIndex
                }
                await this.cacheManager.set(cacheKey, cacheData, 1000 * 60 * 15) // 15 minutes to verify the transaction
                return {
                    success: true,
                    message: "Land limit expanded transaction created successfully",
                    data: {
                        serializedTx: base58.encode(
                            this.solanaService
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

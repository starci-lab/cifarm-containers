import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    KeyValueRecord,
    KeyValueStoreId,
    KeyValueStoreSchema,
    StableCoinName,
    VaultInfos
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import {
    CreateShipSolanaTransactionRequest,
    CreateShipSolanaTransactionResponse
} from "./create-ship-solana-transaction.dto"
import { SolanaService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { ShipService, VaultService } from "@src/gameplay"
import { GraphQLError } from "graphql"
import { UserSchema } from "@src/databases"
import { createNoopSigner } from "@metaplex-foundation/umi"
import { publicKey } from "@metaplex-foundation/umi"
import { transactionBuilder } from "@metaplex-foundation/umi"
import base58 from "bs58"

@Injectable()
export class CreateShipSolanaTransactionService {
    private readonly logger = new Logger(CreateShipSolanaTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly staticService: StaticService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service,
        private readonly shipService: ShipService,
        private readonly vaultService: VaultService
    ) {}

    async createShipSolanaTransaction(
        { id }: UserLike,
        { accountAddress }: CreateShipSolanaTransactionRequest
    ): Promise<CreateShipSolanaTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                const { inventoryMap } = await this.shipService.partitionInventories({
                    userId: id,
                    session
                })
                const enoughs = Object.values(inventoryMap).every((data) => data.enough)
                if (!enoughs) {
                    throw new GraphQLError("Not enough items", {
                        extensions: {
                            code: "NOT_ENOUGH_ITEMS"
                        }
                    })
                }
                // get vault info
                const vaultInfos = await this.connection
                    .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                    .findOne<KeyValueRecord<VaultInfos>>({
                        displayId: KeyValueStoreId.VaultInfos
                    })
                if (!vaultInfos) {
                    throw new GraphQLError("Vaults info not found", {
                        extensions: {
                            code: "VAULTS_INFO_NOT_FOUND"
                        }
                    })
                }
                // we thus create the send transaction from vault
                // vault always pay 5%, at max 5 usc - 1% for each item
                const user = await this.connection.model<UserSchema>(UserSchema.name).findById(id)
                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }
                // compute the paid amount
                const paidAmount = await this.vaultService.computePaidAmount({
                    network: user.network,
                    chainKey: user.chainKey,
                    vaultInfoData: vaultInfos.value[user.chainKey][user.network]
                })
                // get the stable coin address
                const tokenVaultAddress = this.solanaService
                    .getVaultUmi(user.network)
                    .identity.publicKey.toString()
                const { address: tokenAddress, decimals: tokenDecimals } =
                    this.staticService.stableCoins[StableCoinName.USDC][user.chainKey][user.network]
                // create a tx to transfer token from the vault to the user

                const { limitTransaction, priceTransaction } =
                    await this.solanaService.createComputeBudgetTransactions({
                        network: user.network
                    })
                let builder = transactionBuilder().add(limitTransaction).add(priceTransaction)

                const { transaction: transferTokenTransaction } =
                    await this.solanaService.createTransferTokenTransaction({
                        network: user.network,
                        tokenAddress,
                        toAddress: accountAddress,
                        amount: paidAmount,
                        decimals: tokenDecimals,
                        fromAddress: tokenVaultAddress
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
                await this.cacheManager.set(cacheKey, true, 1000 * 60 * 15) // 15 minutes
                return {
                    serializedTx: base58.encode(
                        this.solanaService
                            .getUmi(user.network)
                            .transactions.serialize(transaction)
                    )
                }
            })
            return {
                success: true,
                message: "Ship Solana transaction created successfully",
                data: result
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import { EnergyPurchaseOption, InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { UserSchema } from "@src/databases"
import { GraphQLError } from "graphql"
import {
    SendBuyEnergySolanaTransactionRequest,
    SendBuyEnergySolanaTransactionResponse
} from "./send-buy-energy-solana-transaction.dto"
import { SolanaService } from "@src/blockchain"
import { StaticService } from "@src/gameplay"
import base58 from "bs58"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { Sha256Service } from "@src/crypto"
import { BuyEnergySolanaTransactionCache } from "@src/cache"
import { EnergyService } from "@src/gameplay"
@Injectable()
export class SendBuyEnergySolanaTransactionService {
    private readonly logger = new Logger(SendBuyEnergySolanaTransactionService.name)
    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly solanaService: SolanaService,
        private readonly staticService: StaticService,
        private readonly energyService: EnergyService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly sha256Service: Sha256Service
    ) {}

    async sendBuyEnergySolanaTransaction(
        { id }: UserLike,
        { serializedTx }: SendBuyEnergySolanaTransactionRequest
    ): Promise<SendBuyEnergySolanaTransactionResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            // Using withTransaction to handle the transaction lifecycle
            const result = await mongoSession.withTransaction(async (session) => {
                // get the user
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(id)
                    .session(session)
                if (!user) {
                    throw new Error("User not found")
                }
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
                const cachedTx = await this.cacheManager.get<BuyEnergySolanaTransactionCache>(cacheKey)
                if (!cachedTx) {
                    throw new GraphQLError("Transaction not found in cache", {
                        extensions: {
                            code: "TRANSACTION_NOT_FOUND_IN_CACHE"
                        }
                    })
                }
                const { selectionIndex } = cachedTx
                // add the energy to the user
                const option =
                    this.staticService.energyPurchases[user.chainKey][user.network].options[
                        selectionIndex
                    ] as EnergyPurchaseOption
                if (!option) {
                    throw new GraphQLError("Invalid selection index")
                }
                const { percentage } = option
                // add the amount to the user's gold balance
                const maxEnergy = this.energyService.getMaxEnergy(user.level)
                const newEnergy = Math.min(maxEnergy, Math.floor(maxEnergy * percentage / 100))
                if (newEnergy <= user.energy) {
                    throw new GraphQLError("Energy is already at the maximum limit", {
                        extensions: {
                            code: "ENERGY_ALREADY_AT_THE_MAXIMUM_LIMIT"
                        }
                    })
                }
                this.energyService.add({
                    user,
                    quantity: newEnergy - user.energy
                })
                await user.save({ session })
                // const signedTx = await this.solanaService
                //     .getUmi(user.network)
                //     .identity.signTransaction(tx)
                const txHash = await this.solanaService
                    .getUmi(user.network)
                    .rpc.sendTransaction(tx)
                const latestBlockhash = await this.solanaService
                    .getUmi(user.network)
                    .rpc.getLatestBlockhash()
                await this.solanaService
                    .getUmi(user.network)
                    .rpc.confirmTransaction(txHash, {
                        commitment: "finalized",
                        strategy: {
                            type: "blockhash",
                            blockhash: latestBlockhash.blockhash,
                            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
                        }
                    })
                return {
                    success: true,
                    message: "Ship Solana transaction sent successfully",
                    data: {
                        txHash: base58.encode(txHash)
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

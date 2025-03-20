import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { computeRaw } from "@src/common"
import { Connection } from "mongoose"
import { MintOffchainTokensRequest } from "./mint-offchain-tokens.dto"
import { HoneycombService } from "@src/honeycomb"
import { TokenBalanceService, StaticService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { TxResponse } from "../types"
import { GraphQLError } from "graphql"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class MintOffchainTokensService {
    private readonly logger = new Logger(MintOffchainTokensService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly honeycombService: HoneycombService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async mintOffchainTokensService(
        { id: userId }: UserLike,
        { amount }: MintOffchainTokensRequest
    ): Promise<TxResponse> {
        const mongoSession = await this.connection.startSession()
        let user: UserSchema | undefined
        try {
            const result = await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE AND UPDATE TOKEN BALANCE
                 ************************************************************/
                // Check if user has enough tokens
                if (user.tokens < amount) {
                    throw new GraphQLError("Insufficient tokens", {
                        extensions: {
                            code: "INSUFFICIENT_TOKENS"
                        }
                    })
                }

                // Subtract tokens from user's balance
                this.tokenBalanceService.subtract({
                    user,
                    amount
                })

                /************************************************************
                 * CREATE MINT TRANSACTION
                 ************************************************************/
                const { tokenResourceAddress, decimals } = this.staticService.honeycombInfo

                const { txResponse } = await this.honeycombService.createMintResourceTransaction({
                    amount: computeRaw(amount, decimals).toString(),
                    resourceAddress: tokenResourceAddress,
                    network: user.network,
                    payerAddress: user.accountAddress,
                    toAddress: user.accountAddress
                })

                /************************************************************
                 * UPDATE USER DATA
                 ************************************************************/
                // Update user token balance
                this.tokenBalanceService.subtract({
                    user,
                    amount
                })
                await user.save({ session: mongoSession })

                return txResponse
            })
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        { value: JSON.stringify({ userId, user: user.toJSON() }) }
                    ]
                })
            ])
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

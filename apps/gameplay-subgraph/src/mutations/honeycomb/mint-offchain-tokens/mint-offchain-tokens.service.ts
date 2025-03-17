import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    UserSchema
} from "@src/databases"
import { computeRaw } from "@src/common"
import { Connection } from "mongoose"
import { MintOffchainTokensRequest } from "./mint-offchain-tokens.dto"
import { HoneycombService } from "@src/honeycomb"
import { TokenBalanceService, StaticService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { TxResponse } from "../types"
@Injectable()
export class MintOffchainTokensService {
    private readonly logger = new Logger(MintOffchainTokensService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly honeycombService: HoneycombService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly staticService: StaticService
    ) {}

    async mintOffchainTokensService(
        { id: userId }: UserLike,
        { amount }: MintOffchainTokensRequest
    ): Promise<TxResponse> {
        const mongoSession = await this.connection.startSession()
        try {
            const result = await mongoSession.withTransaction(async () => {
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                const tokenBalanceChanges = this.tokenBalanceService.subtract({
                    user,
                    amount
                })
                const { tokenResourceAddress, decimals } = this.staticService.honeycombInfo

                const { txResponse } = await this.honeycombService.createMintResourceTransaction({
                    amount: computeRaw(amount, decimals).toString(),
                    resourceAddress: tokenResourceAddress,
                    network: user.network,
                    payerAddress: user.accountAddress,
                    toAddress: user.accountAddress
                })
                console.log(user.accountAddress)

                // update user honeycomb daily reward last claim time
                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne(
                        { _id: userId },
                        {
                            $set: {
                                ...tokenBalanceChanges
                            }
                        }
                    )
                    .session(mongoSession)
                return txResponse
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

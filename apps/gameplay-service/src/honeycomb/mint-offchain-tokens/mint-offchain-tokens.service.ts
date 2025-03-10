import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    SystemId,
    KeyValueRecord,
    SystemSchema,
    UserSchema,
    HoneycombInfo
} from "@src/databases"
import { computeRaw, createObjectId } from "@src/common"
import { Connection } from "mongoose"
import { MintOffchainTokensRequest, MintOffchainTokensResponse } from "./mint-offchain-tokens.dto"
import { HoneycombService } from "@src/honeycomb"
import { TokenBalanceService } from "@src/gameplay"

@Injectable()
export class MintOffchainTokensService {
    private readonly logger = new Logger(MintOffchainTokensService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly honeycombService: HoneycombService,
        private readonly tokenBalanceService: TokenBalanceService
    ) {}

    async mintOffchainTokensService({
        userId,
        amount
    }: MintOffchainTokensRequest): Promise<MintOffchainTokensResponse> {
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
                const {
                    value: { tokenResourceAddress, decimals }
                } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<HoneycombInfo>>(createObjectId(SystemId.HoneycombInfo))
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

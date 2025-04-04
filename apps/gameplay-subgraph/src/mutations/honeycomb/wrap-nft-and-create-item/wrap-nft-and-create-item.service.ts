import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose } from "@src/databases"
import { Connection } from "mongoose"
import { WrapNFTAndCreateItemRequest, WrapNFTAndCreateItemResponse } from "./wrap-nft-and-create-item.dto"
import { HoneycombService } from "@src/honeycomb"
import { TokenBalanceService, StaticService, SyncService } from "@src/gameplay"
import { UserLike } from "@src/jwt"
import { InjectKafkaProducer } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class WrapNFTAndCreateItemService {
    private readonly logger = new Logger(WrapNFTAndCreateItemService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly honeycombService: HoneycombService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async wrapNftAndCreateItemService(
        { id: userId }: UserLike,
        { chainKey, network, nftAddress, collectionAddress }: WrapNFTAndCreateItemRequest
    ): Promise<WrapNFTAndCreateItemResponse> {
        const mongoSession = await this.connection.startSession()
        //let syncedUser: WithStatus<UserSchema> | undefined
        try {
            console.log(chainKey, network, nftAddress, collectionAddress)
            console.log(userId)
            // const result = await mongoSession.withTransaction(async (mongoSession) => {
            //     // const { txResponse } = await this.honeycombService.createMintResourceTransaction({
            //     //     amount: computeRaw(amount, decimals).toString(),
            //     //     resourceAddress: tokenResourceAddress,
            //     //     network: user.network,
            //     //     payerAddress: user.accountAddress,
            //     //     toAddress: user.accountAddress
            //     // })

            //     // /************************************************************
            //     //  * UPDATE USER DATA
            //     //  ************************************************************/
            //     // // Update user token balance
            //     // this.tokenBalanceService.subtract({
            //     //     user,
            //     //     amount
            //     // })
            //     // await user.save({ session: mongoSession })
            //     // syncedUser = this.syncService.getPartialUpdatedSyncedUser({
            //     //     userSnapshot,
            //     //     userUpdated: user
            //     // })
            //     //return txResponse
            // })
            // await Promise.all([
            //     this.kafkaProducer.send({
            //         topic: KafkaTopic.SyncUser,
            //         messages: [
            //             { value: JSON.stringify({ userId, data: syncedUser }) }
            //         ]
            //     })
            // ])
            // return {
            //     success: true,
            //     message: "Mint offchain tokens successfully",
            //     data: result
            // }
            return {
                success: true,
                message: "Mint offchain tokens successfully",
                data: {
                    blockhash: "0x1234567890abcdef",
                    lastValidBlockHeight: 1234567890,
                    transaction: "0x1234567890abcdef"
                }
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

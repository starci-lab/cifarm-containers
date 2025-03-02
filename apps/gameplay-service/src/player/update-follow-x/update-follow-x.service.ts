import { Injectable, Logger } from "@nestjs/common"
import {
    DefaultInfo,
    InjectMongoose,
    KeyValueRecord,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { UpdateFollowXRequest, UpdateFollowXResponse } from "./update-follow-x.dto"
import { createObjectId } from "@src/common"
import { TokenBalanceService } from "@src/gameplay"

@Injectable()
export class UpdateFollowXService {
    private readonly logger = new Logger(UpdateFollowXService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tokenBalanceService: TokenBalanceService
    ) {}

    async updateFollowX({
        userId
    }: UpdateFollowXRequest): Promise<UpdateFollowXResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const {
                value: { followXRewardQuantity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                .session(mongoSession)
            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)
                    
            if (user.followXAwarded) {
                return {}
            }

            const tokenBalanceChanges = this.tokenBalanceService.add({
                user,
                amount: followXRewardQuantity
            })

            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne(
                    { _id: userId },
                    {
                        $set: {
                            ...tokenBalanceChanges,
                            followXAwarded: true
                        },
                    }
                )
                .session(mongoSession)
            await mongoSession.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}

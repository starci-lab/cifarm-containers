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
import { UpdateReferralRequest, UpdateReferralResponse } from "./update-referral.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { TokenBalanceService } from "@src/gameplay"

@Injectable()
export class UpdateReferralService {
    private readonly logger = new Logger(UpdateReferralService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly tokenBalanceService: TokenBalanceService
    ) {}

    async updateReferral({
        referralUserId,
        userId
    }: UpdateReferralRequest): Promise<UpdateReferralResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const {
                value: { referredLimit, referralRewardQuantity, referredRewardQuantity }
            } = await this.connection
                .model<SystemSchema>(SystemSchema.name)
                .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                .session(mongoSession)
            const referralUser = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(referralUserId)
                .session(mongoSession)
            if (!referralUser) {
                throw new GrpcNotFoundException("Referral user not found")
            }
            if (referralUser.referredUserIds.length > referredLimit) {
                throw new GrpcFailedPreconditionException("Referral user has reached the limit")
            }
            const user = await this.connection
                .model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)

            // check if referral user is the same as the user
            if (referralUserId === userId) {
                throw new GrpcFailedPreconditionException(
                    "Referral user cannot be the same as the user"
                )
            }

            // check if user already has referral
            if (user.referralUserId) {
                return {}
            }
            // check if user is already referred by the referral user
            if (referralUser.referredUserIds.map((userId) => userId.toString()).includes(user.id)) {
                return {}
            }
            // check if limit is reached
            if (referralUser.referredUserIds.length >= referredLimit) {
                return {}
            }

            const referralUserTokenBalanceChanges = this.tokenBalanceService.add({
                amount: referredRewardQuantity,
                user: referralUser
            })
            const userTokenBalanceChanges = this.tokenBalanceService.add({
                amount: referralRewardQuantity,
                user
            })

            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne(
                    { _id: referralUserId },
                    {
                        $set: {
                            ...referralUserTokenBalanceChanges
                        },
                        $push: {
                            referredUserIds: userId
                        }
                    }
                )
                .session(mongoSession)

            await this.connection
                .model<UserSchema>(UserSchema.name)
                .updateOne(
                    { _id: userId },
                    {
                        $set: {
                            ...userTokenBalanceChanges,
                            referralUserId: referralUserId
                        }
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

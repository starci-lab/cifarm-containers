import { Injectable, Logger } from "@nestjs/common"
import { UnfollowRequest, UnfollowResponse } from "./unfollow.dto"
import { InjectPostgreSQL, UsersFollowingUsersEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"

@Injectable()
export class UnfollowService {
    private readonly logger = new Logger(UnfollowService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    async unfollow(request: UnfollowRequest): Promise<UnfollowResponse> {
        if (request.userId === request.followeeUserId) {
            throw new GrpcInvalidArgumentException("Cannot unfollow yourself")
        }
        
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        const followed = await queryRunner.manager.findOne(UsersFollowingUsersEntity, {
            where: {
                followerId: request.userId,
                followeeUserId: request.followeeUserId
            }
        })
        if (!followed) {
            throw new GrpcNotFoundException("User is not followed")
        }
        try {
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.delete(UsersFollowingUsersEntity, {
                    id: followed.id
                })
                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            return {}
        } finally {
            await queryRunner.release()
        }
    }
}

import { Injectable, Logger } from "@nestjs/common"
import { UnfollowRequest, UnfollowResponse } from "./unfollow.dto"
import { InjectPostgreSQL, UsersFollowingUsersEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { GrpcInternalException } from "nestjs-grpc-exceptions"

@Injectable()
export class UnfollowService {
    private readonly logger = new Logger(UnfollowService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {}

    async unfollow(request: UnfollowRequest): Promise<UnfollowResponse> {
        this.logger.debug(`Unfollow user ${request.unfollowedUserId} for user ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.delete(UsersFollowingUsersEntity, {
                    followerId: request.userId,
                    followeeId: request.unfollowedUserId
                })
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

import { Injectable, Logger } from "@nestjs/common"
import { InjectPostgreSQL, UserEntity, UsersFollowingUsersEntity } from "@src/databases"
import { DataSource } from "typeorm"
import { FollowRequest } from "./follow.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class FollowService {
    private readonly logger = new Logger(FollowService.name)

    
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource
    ) {
    }

    async follow(request: FollowRequest) {
        this.logger.debug(`Follow user ${request.followedUserId} for user ${request.userId}`)

        if (
            request.userId.localeCompare(request.followedUserId, undefined, {
                sensitivity: "base"
            }) === 0
        ) {
            throw new GrpcFailedPreconditionException("Cannot follow self")
        }

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const userExists = await queryRunner.manager.exists(UserEntity, {
                where: { id: request.followedUserId }
            })
            if (!userExists) {
                throw new GrpcNotFoundException("User not found")
            }
            await queryRunner.manager.save(UsersFollowingUsersEntity, {
                followerId: request.userId,
                followeeId: request.followedUserId
            })
        } finally {
            await queryRunner.release()
        }
    }
}

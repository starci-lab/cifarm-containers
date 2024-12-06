import { Injectable, Logger } from "@nestjs/common"
import { FollowRequest } from "./follow.dto"
import { DataSource } from "typeorm"
import { UserEntity } from "@src/database"
import { FollowRecordEntity } from "@src/database/gameplay-postgresql/follow-record.entity"
import { SelfFollowException, UserNotFoundException } from "@src/exceptions"

@Injectable()
export class FollowService {
    private readonly logger = new Logger(FollowService.name)

    constructor(private readonly dataSource: DataSource) {}

    async follow(request: FollowRequest) {
        this.logger.debug(`Follow user ${request.followedUserId} for user ${request.userId}`)

        if (
            request.userId.localeCompare(request.followedUserId, undefined, {
                sensitivity: "base"
            }) === 0
        ) {
            throw new SelfFollowException(request.followedUserId)
        }

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const userExists = await queryRunner.manager.exists(UserEntity, {
                where: { id: request.followedUserId }
            })
            if (!userExists) {
                throw new UserNotFoundException(request.followedUserId)
            }
            await queryRunner.manager.save(FollowRecordEntity, {
                followerId: request.userId,
                followeeId: request.followedUserId
            })
        } finally {
            await queryRunner.release()
        }
    }
}

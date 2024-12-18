import { Injectable, Logger } from "@nestjs/common"
import { UnfollowRequest } from "./unfollow.dto"
import { UsersFollowingUsersEntity } from "@src/database"
import { DataSource } from "typeorm"

@Injectable()
export class UnfollowService {
    private readonly logger = new Logger(UnfollowService.name)

    constructor(private readonly dataSource: DataSource) {}

    async unfollow(request: UnfollowRequest) {
        this.logger.debug(`Unfollow user ${request.unfollowedUserId} for user ${request.userId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.manager.delete(UsersFollowingUsersEntity, {
                followerId: request.userId,
                followeeId: request.unfollowedUserId
            })
        } finally {
            await queryRunner.release()
        }
    }
}

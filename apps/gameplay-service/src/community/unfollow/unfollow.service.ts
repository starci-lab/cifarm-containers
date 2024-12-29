import { Injectable, Logger } from "@nestjs/common"
import { UnfollowRequest } from "./unfollow.dto"
import { GameplayPostgreSQLService, UsersFollowingUsersEntity } from "@src/databases"
import { DataSource } from "typeorm"

@Injectable()
export class UnfollowService {
    private readonly logger = new Logger(UnfollowService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSQLService: GameplayPostgreSQLService
    ) {
        this.dataSource = this.gameplayPostgreSQLService.getDataSource()
    }

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

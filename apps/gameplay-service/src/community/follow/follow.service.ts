import { Injectable, Logger } from "@nestjs/common"
import { FollowRequest } from "./follow.dto"
import { DataSource } from "typeorm"
import { UserEntity } from "@src/databases"
import { SelfFollowException, UserNotFoundException } from "@src/exceptions"
import { GameplayPostgreSQLService, UsersFollowingUsersEntity } from "@src/databases"

@Injectable()
export class FollowService {
    private readonly logger = new Logger(FollowService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSQLService: GameplayPostgreSQLService
    ) {
        this.dataSource = this.gameplayPostgreSQLService.getDataSource()
    }

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
            await queryRunner.manager.save(UsersFollowingUsersEntity, {
                followerId: request.userId,
                followeeId: request.followedUserId
            })
        } finally {
            await queryRunner.release()
        }
    }
}

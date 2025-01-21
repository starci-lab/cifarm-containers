// npx jest apps/gameplay-service/src/community/unfollow/unfollow.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { UnfollowService } from "./unfollow.service"
import { GameplayMockUserService, ConnectionService, TestingInfraModule } from "@src/testing"
import { getPostgreSqlToken, UsersFollowingUsersEntity } from "@src/databases"
import { v4 } from "uuid"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"

describe("UnfollowService", () => {
    let service: UnfollowService
    let dataSource: DataSource
    let gameplayMockUserService: GameplayMockUserService
    let connectionService: ConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UnfollowService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(UnfollowService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        connectionService = moduleRef.get(ConnectionService)
    })

    it("should successfully unfollow user", async () => {
        const user = await gameplayMockUserService.generate()
        const followeeUser = await gameplayMockUserService.generate()
        await dataSource.manager.save(UsersFollowingUsersEntity, {
            followerId: user.id,
            followeeUserId: followeeUser.id
        })
        await service.unfollow({
            userId: user.id,
            followeeUserId: followeeUser.id
        })
        const unfollowed = await dataSource.manager.findOne(UsersFollowingUsersEntity, {
            where: { followerId: user.id, followeeUserId: followeeUser.id },
        })
        expect(unfollowed).toBeNull()
    })

    it("should not attempt to unfollow if user is not following the target user", async () => {
        const user = await gameplayMockUserService.generate()
        // No follow relationship is established, so no need to save anything in the database
        const targetUserId = v4()
        await expect(service.unfollow({
            userId: user.id,
            followeeUserId: targetUserId
        })).rejects.toThrow(GrpcNotFoundException)

    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})

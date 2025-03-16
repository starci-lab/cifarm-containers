// npx jest apps/gameplay-service/src/community/follow/follow.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { GameplayMockUserService, GameplayConnectionService, TestingInfraModule } from "@src/testing"
import { getPostgreSqlToken, UsersFollowingUsersEntity } from "@src/databases"
import { v4 } from "uuid"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { FollowService } from "./visit.service"

describe("FollowService", () => {
    let service: FollowService
    let dataSource: DataSource
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [FollowService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(FollowService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully follow user", async () => {
        const user = await gameplayMockUserService.generate()
        const targetUser = await gameplayMockUserService.generate()
        await service.follow({
            userId: user.id,
            followeeUserId: targetUser.id
        })
        const followed = await dataSource.manager.findOne(UsersFollowingUsersEntity, {
            where: { followerId: user.id, followeeUserId: targetUser.id }
        })
        expect(followed).toBeTruthy()
    })

    it("should throw error when trying to follow a non-existent user", async () => {
        const user = await gameplayMockUserService.generate()
        const nonExistentUserId = v4() // Generate a non-existent user ID (UUID format)
        
        try {
            await service.follow({
                userId: user.id,
                followeeUserId: nonExistentUserId
            })
        } catch (error) {
            expect(error).toBeInstanceOf(GrpcNotFoundException)
        }
    })

    it("should throw error when trying to follow oneself", async () => {
        const user = await gameplayMockUserService.generate()
        
        try {
            await service.follow({
                userId: user.id,
                followeeUserId: user.id
            })
        } catch (error) {
            // Ensure that following oneself is not allowed (Assumption)
            expect(error).toBeInstanceOf(GrpcInvalidArgumentException)
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})

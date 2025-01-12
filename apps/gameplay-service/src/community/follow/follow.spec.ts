//npx jest apps/gameplay-service/src/community/follow/follow.spec.ts

import { UserEntity, UsersFollowingUsersEntity } from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { FollowRequest } from "./follow.dto"
import { FollowModule } from "./follow.module"
import { FollowService } from "./follow.service"

describe("FollowService", () => {
    let dataSource: DataSource
    let service: FollowService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }
    const mockFollowedUser: DeepPartial<UserEntity> = {
        ...MOCK_USER,
        username: "followedUser"
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [FollowModule]
        })
        dataSource = ds
        service = module.get<FollowService>(FollowService)
    })

    it("Should successfully follow another user", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Mock users
            const user = await queryRunner.manager.save(UserEntity, mockUser)

            const followedUser = await queryRunner.manager.save(UserEntity, mockFollowedUser)

            const request: FollowRequest = {
                userId: user.id,
                followedUserId: followedUser.id
            }

            await service.follow(request)

            // Verify follow record created
            const followRecord = await queryRunner.manager.findOne(UsersFollowingUsersEntity, {
                where: {
                    followerId: user.id,
                    followeeId: followedUser.id
                }
            })
            expect(followRecord).toBeDefined()
            expect(followRecord.followerId).toBe(user.id)
            expect(followRecord.followeeId).toBe(followedUser.id)
        } finally {
            await queryRunner.release()
        }
    })

    afterAll(async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()
            await queryRunner.manager.delete(UserEntity, { id: mockUser.id })
            await queryRunner.manager.delete(UserEntity, { id: mockFollowedUser.id })
            await queryRunner.manager.delete(UsersFollowingUsersEntity, {})
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})

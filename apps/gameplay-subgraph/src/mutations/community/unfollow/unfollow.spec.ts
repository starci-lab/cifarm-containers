// npx jest apps/gameplay-subgraph/src/mutations/community/unfollow/unfollow.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import {
    getMongooseToken,
    UserFollowRelationSchema
} from "@src/databases"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { Connection } from "mongoose"
import { UnfollowService } from "./unfollow.service"
import { GraphQLError } from "graphql"

describe("UnfollowService", () => {
    let connection: Connection
    let service: UnfollowService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UnfollowService]
        }).compile()

        connection = module.get<Connection>(getMongooseToken())
        service = module.get<UnfollowService>(UnfollowService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
    })

    it("should successfully unfollow a user", async () => {
        // Generate two users
        const followerUser = await gameplayMockUserService.generate()
        const followeeUser = await gameplayMockUserService.generate()

        // Create a follow relation
        await connection.model<UserFollowRelationSchema>(UserFollowRelationSchema.name).create({
            follower: followerUser.id,
            followee: followeeUser.id
        })

        // Verify the follow relation exists
        const followRelationBefore = await connection
            .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
            .findOne({
                follower: followerUser.id,
                followee: followeeUser.id
            })

        expect(followRelationBefore).toBeTruthy()

        // Call the unfollow service
        await service.unfollow(
            { id: followerUser.id },
            { followeeUserId: followeeUser.id }
        )

        // Verify the follow relation no longer exists
        const followRelationAfter = await connection
            .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
            .findOne({
                follower: followerUser.id,
                followee: followeeUser.id
            })

        expect(followRelationAfter).toBeNull()
    })

    it("should throw GraphQLError with code FOLLOWEE_NOT_FOUND when followee does not exist", async () => {
        // Generate a user
        const followerUser = await gameplayMockUserService.generate()
        
        // Create a non-existent user ID
        const nonExistentUserId = createObjectId()

        try {
            await service.unfollow(
                { id: followerUser.id },
                { followeeUserId: nonExistentUserId }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("FOLLOWEE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code USER_NOT_FOUND when follower does not exist", async () => {
        // Generate a user
        const followeeUser = await gameplayMockUserService.generate()
        
        // Create a non-existent user ID
        const nonExistentUserId = createObjectId()

        try {
            await service.unfollow(
                { id: nonExistentUserId },
                { followeeUserId: followeeUser.id }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("USER_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code NOT_FOLLOWING when follow relation does not exist", async () => {
        // Generate two users
        const followerUser = await gameplayMockUserService.generate()
        const followeeUser = await gameplayMockUserService.generate()

        // No follow relation is created

        try {
            await service.unfollow(
                { id: followerUser.id },
                { followeeUserId: followeeUser.id }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("NOT_FOLLOWING")
        }
    })

    it("should handle multiple unfollow operations correctly", async () => {
        // Generate users
        const followerUser = await gameplayMockUserService.generate()
        const followeeUser1 = await gameplayMockUserService.generate()
        const followeeUser2 = await gameplayMockUserService.generate()

        // Create follow relations
        await connection.model<UserFollowRelationSchema>(UserFollowRelationSchema.name).create([
            {
                follower: followerUser.id,
                followee: followeeUser1.id
            },
            {
                follower: followerUser.id,
                followee: followeeUser2.id
            }
        ])

        // Unfollow the first user
        await service.unfollow(
            { id: followerUser.id },
            { followeeUserId: followeeUser1.id }
        )

        // Verify only the first relation is removed
        const followRelation1 = await connection
            .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
            .findOne({
                follower: followerUser.id,
                followee: followeeUser1.id
            })

        const followRelation2 = await connection
            .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
            .findOne({
                follower: followerUser.id,
                followee: followeeUser2.id
            })

        expect(followRelation1).toBeNull()
        expect(followRelation2).toBeTruthy()

        // Unfollow the second user
        await service.unfollow(
            { id: followerUser.id },
            { followeeUserId: followeeUser2.id }
        )

        // Verify the second relation is also removed
        const followRelation2After = await connection
            .model<UserFollowRelationSchema>(UserFollowRelationSchema.name)
            .findOne({
                follower: followerUser.id,
                followee: followeeUser2.id
            })

        expect(followRelation2After).toBeNull()
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})

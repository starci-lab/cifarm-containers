// npx jest apps/gameplay-subgraph/src/mutations/community/visit/visit.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import {
    getMongooseToken,
    UserSchema
} from "@src/databases"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { Connection } from "mongoose"
import { VisitService } from "./visit.service"
import { GraphQLError } from "graphql"
import { KafkaTopic } from "@src/brokers"

describe("VisitService", () => {
    let connection: Connection
    let service: VisitService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let mockKafkaProducer: { send: jest.Mock }

    beforeAll(async () => {
        // Create a mock Kafka producer
        mockKafkaProducer = {
            send: jest.fn().mockResolvedValue(undefined)
        }

        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [VisitService]
        })
            .overrideProvider("KAFKA_PRODUCER")
            .useValue(mockKafkaProducer)
            .compile()

        connection = module.get<Connection>(getMongooseToken())
        service = module.get<VisitService>(VisitService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
    })

    beforeEach(() => {
        // Reset the mock before each test
        mockKafkaProducer.send.mockClear()
    })

    it("should successfully visit a specific neighbor", async () => {
        // Generate two users
        const visitorUser = await gameplayMockUserService.generate()
        const neighborUser = await gameplayMockUserService.generate()

        // Call the visit service with a specific neighbor
        const result = await service.visit(
            { id: visitorUser.id },
            { neighborUserId: neighborUser.id }
        )

        // Verify the result
        expect(result).toBeDefined()
        expect(result.neighborUserId).toBe(neighborUser.id)

        // Verify that Kafka message was sent
        expect(mockKafkaProducer.send).toHaveBeenCalledTimes(1)
        expect(mockKafkaProducer.send).toHaveBeenCalledWith({
            topic: KafkaTopic.Visit,
            messages: [
                {
                    value: JSON.stringify({
                        userId: visitorUser.id,
                        neighborUserId: neighborUser.id
                    })
                }
            ]
        })
    })

    it("should successfully visit a random neighbor when no neighborUserId is provided", async () => {
        // Generate multiple users to ensure there's at least one random user to visit
        const visitorUser = await gameplayMockUserService.generate()
        const randomUser1 = await gameplayMockUserService.generate()
        const randomUser2 = await gameplayMockUserService.generate()

        // Call the visit service without specifying a neighbor
        const result = await service.visit(
            { id: visitorUser.id },
            {}
        )

        // Verify the result
        expect(result).toBeDefined()
        expect(result.neighborUserId).toBeTruthy()
        
        // The result should be one of the random users, not the visitor
        expect(result.neighborUserId).not.toBe(visitorUser.id)
        expect([randomUser1.id, randomUser2.id]).toContain(result.neighborUserId)

        // Verify that Kafka message was sent
        expect(mockKafkaProducer.send).toHaveBeenCalledTimes(1)
        expect(mockKafkaProducer.send).toHaveBeenCalledWith({
            topic: KafkaTopic.Visit,
            messages: [
                {
                    value: JSON.stringify({
                        userId: visitorUser.id,
                        neighborUserId: result.neighborUserId
                    })
                }
            ]
        })
    })

    it("should throw GraphQLError with code NO_RANDOM_USER_FOUND when no other users exist", async () => {
        // Clear all users first
        await connection.model<UserSchema>(UserSchema.name).deleteMany({})
        
        // Generate only one user (the visitor)
        const visitorUser = await gameplayMockUserService.generate()

        // Call the visit service without specifying a neighbor
        try {
            await service.visit(
                { id: visitorUser.id },
                {}
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("NO_RANDOM_USER_FOUND")
        }

        // Verify that no Kafka message was sent
        expect(mockKafkaProducer.send).not.toHaveBeenCalled()
    })

    it("should handle Kafka producer errors gracefully", async () => {
        // Generate two users
        const visitorUser = await gameplayMockUserService.generate()
        const neighborUser = await gameplayMockUserService.generate()

        // Make the Kafka producer throw an error
        mockKafkaProducer.send.mockRejectedValueOnce(new Error("Kafka error"))

        // Call the visit service and expect it to throw
        await expect(
            service.visit(
                { id: visitorUser.id },
                { neighborUserId: neighborUser.id }
            )
        ).rejects.toThrow("Kafka error")
    })

    it("should handle multiple visit operations correctly", async () => {
        // Generate multiple users
        const visitorUser = await gameplayMockUserService.generate()
        const neighborUser1 = await gameplayMockUserService.generate()
        const neighborUser2 = await gameplayMockUserService.generate()

        // Visit the first neighbor
        const result1 = await service.visit(
            { id: visitorUser.id },
            { neighborUserId: neighborUser1.id }
        )

        // Verify the first visit
        expect(result1.neighborUserId).toBe(neighborUser1.id)
        expect(mockKafkaProducer.send).toHaveBeenCalledTimes(1)

        // Reset the mock
        mockKafkaProducer.send.mockClear()

        // Visit the second neighbor
        const result2 = await service.visit(
            { id: visitorUser.id },
            { neighborUserId: neighborUser2.id }
        )

        // Verify the second visit
        expect(result2.neighborUserId).toBe(neighborUser2.id)
        expect(mockKafkaProducer.send).toHaveBeenCalledTimes(1)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
}) 
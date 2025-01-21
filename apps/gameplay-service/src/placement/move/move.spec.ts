// npx jest apps/gameplay-service/src/placement/move/move.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { MoveService } from "./move.service"
import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { PlacedItemEntity, PlacedItemTypeId, getPostgreSqlToken } from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { v4 } from "uuid"

describe("MoveService", () => {
    let service: MoveService
    let dataSource: DataSource
    let gameplayMockUserService: GameplayMockUserService
    let connectionService: ConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [MoveService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(MoveService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        connectionService = moduleRef.get(ConnectionService)
    })

    it("should successfully move placed item to a new position", async () => {
        const user = await gameplayMockUserService.generate()
        const placedItem = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            x: 1,
            y: 1,
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })

        // Act: Call the move service
        await service.move({
            userId: user.id,
            placedItemId: placedItem.id,
            position: { x: 5, y: 5 }
        })

        // Assert: Check that the placed item's position has been updated
        const updatedPlacedItem = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: placedItem.id }
        })

        expect(updatedPlacedItem.x).toBe(5)
        expect(updatedPlacedItem.y).toBe(5)
    })

    it("should throw GrpcNotFoundException when placed item not found", async () => {
        const user = await gameplayMockUserService.generate()

        await expect(service.move({
            userId: user.id, // Invalid user ID
            placedItemId: v4(), // Invalid placed item ID
            position: { x: 5, y: 5 }
        })).rejects.toThrow(GrpcNotFoundException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})
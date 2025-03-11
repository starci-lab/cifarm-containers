// npx jest apps/gameplay-service/src/placement/move/move.spec.ts

import { Test } from "@nestjs/testing"
import { MoveService } from "./sell.service"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { getMongooseToken, PlacedItemSchema, PlacedItemTypeId } from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

describe("MoveService", () => {
    let service: MoveService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [MoveService]
        }).compile()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(MoveService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully move placed item to a new position", async () => {
        const user = await gameplayMockUserService.generate()

        const placedItem = await connection.model(PlacedItemSchema.name).create({
            userId: user.id,
            x: 1,
            y: 1,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })

        // Act: Call the move service
        await service.move({
            userId: user.id,
            placedItemId: placedItem.id,
            position: { x: 5, y: 5 }
        })

        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItem.id)

        expect(updatedPlacedItem.x).toBe(5)
        expect(updatedPlacedItem.y).toBe(5)
    })

    it("should throw GrpcNotFoundException when placed item not found", async () => {
        const user = await gameplayMockUserService.generate()

        await expect(service.move({
            userId: user.id, // Invalid user ID
            placedItemId: createObjectId("test"), // Invalid placed item ID
            position: { x: 5, y: 5 }
        })).rejects.toThrow(GrpcNotFoundException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
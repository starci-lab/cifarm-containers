// npx jest apps/gameplay-service/src/claim/spin/spin.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { SpinService } from "./spin.service"
import { AppearanceChance, CropId,  getMongooseToken,  InventorySchema,  InventoryType, InventoryTypeSchema, SpinPrizeType, SupplyId, UserSchema } from "@src/databases"
import { DateUtcService } from "@src/date"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { Connection } from "mongoose"

describe("SpinService", () => {
    let service: SpinService
    let connection: Connection
    let dateUtcService: DateUtcService
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService
    
    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register(),
            ],
            providers: [
                SpinService,
            ]
        }).compile()

        service = module.get(SpinService)
        connection = module.get(getMongooseToken())
        dateUtcService = module.get(DateUtcService)
        gameplayMockUserService = module.get(GameplayMockUserService)
        gameplayConnectionService = module.get(GameplayConnectionService)
    })

    it("should grant gold reward when spinning", async () => {
        const spinSlotId = createObjectId("slot1")
        const golds = 100

        jest.spyOn(service, "getRandomSlot").mockReturnValueOnce({
            id: spinSlotId,
            spinPrize: {
                type: SpinPrizeType.Gold,
                quantity: golds,
                appearanceChance: AppearanceChance.Common,
                id: createObjectId("prize1"),
            }  
        })

        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().subtract(2, "day").toDate()
        })

        const { spinSlotId: responseSpinSlotId } = await service.spin({
            userId: user.id
        })

        const userAfter = await connection.model(UserSchema.name).findById(user.id)

        expect(userAfter.golds - user.golds).toBe(golds)
        expect(responseSpinSlotId).toBe(spinSlotId)  
    })

    it("should throw GrpcFailedPreconditionException if user has spun in the last 24 hours", async () => {
        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().toDate()
        })

        await expect(service.spin({
            userId: user.id
        })).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should grant token reward when spinning", async () => {
        const spinSlotId = createObjectId("slot2")
        const tokens = 100
        jest.spyOn(service, "getRandomSlot").mockReturnValueOnce({
            id: spinSlotId,
            spinPrize: {
                type: SpinPrizeType.Token,
                quantity: tokens,
                appearanceChance: AppearanceChance.Common,
                id: createObjectId("prize2"),
            }  
        })

        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().subtract(2, "day").toDate()
        })

        const { spinSlotId: responseSpinSlotId } = await service.spin({
            userId: user.id
        })

        const userAfter = await connection.model(UserSchema.name).findById(user.id)

        expect(userAfter.tokens - user.tokens).toBe(tokens)
        expect(responseSpinSlotId).toBe(spinSlotId)  
    })

    it("should grant supply reward when spinning", async () => {
        const spinSlotId = createObjectId("slot3")
        const quantity = 10

        jest.spyOn(service, "getRandomSlot").mockReturnValueOnce({
            id: spinSlotId,
            spinPrize: {
                type: SpinPrizeType.Supply,
                supply: createObjectId(SupplyId.BasicFertilizer),
                appearanceChance: AppearanceChance.Common,
                quantity,
                id: createObjectId("supply1"),
            }  
        })

        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().subtract(2, "day").toDate()
        })

        const { spinSlotId: responseSpinSlotId } = await service.spin({
            userId: user.id
        })

        const inventoryType = await connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).findOne({
            type: InventoryType.Supply,
            supply: createObjectId(SupplyId.BasicFertilizer)
        })

        const inventory = await connection.model<InventorySchema>(InventorySchema.name).findOne({
            user: user.id,
            inventoryType: inventoryType.id
        })

        expect(inventory.quantity).toBe(quantity)
        expect(responseSpinSlotId).toBe(spinSlotId)  
    })

    it("should grant seed reward when spinning", async () => {
        const spinSlotId = createObjectId("slot4")
        const quantity = 10
        const cropId = CropId.Carrot

        jest.spyOn(service, "getRandomSlot").mockReturnValueOnce({
            id: spinSlotId,
            spinPrize: {
                type: SpinPrizeType.Seed,
                crop: createObjectId(cropId),
                appearanceChance: AppearanceChance.Common,
                quantity,
                id: createObjectId("seed1"),
            }  
        })

        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().subtract(2, "day").toDate()
        })

        const { spinSlotId: responseSpinSlotId } = await service.spin({
            userId: user.id
        })

        const inventoryType = await connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).findOne({
            type: InventoryType.Supply,
            supply: createObjectId(SupplyId.BasicFertilizer)
        })

        const inventory = await connection.model<InventorySchema>(InventorySchema.name).findOne({
            user: user.id,
            inventoryType: inventoryType.id
        })

        expect(inventory.quantity).toBe(quantity)
        expect(responseSpinSlotId).toBe(spinSlotId)  
    })

    afterEach(async () => {
        jest.clearAllMocks()
    })
    
    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})

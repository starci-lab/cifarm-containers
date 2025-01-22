// npx jest apps/gameplay-service/src/claim/spin/spin.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { SpinService } from "./spin.service"
import { DataSource } from "typeorm"
import { AppearanceChance, CropId, getPostgreSqlToken, InventoryEntity, InventoryType, SpinPrizeType, SupplyId, UserEntity } from "@src/databases"
import { DateUtcService } from "@src/date"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { GrpcFailedPreconditionException } from "@src/common"
import { v4 } from "uuid"

describe("SpinService", () => {
    let service: SpinService
    let dataSource: DataSource
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
        dataSource = module.get(getPostgreSqlToken())
        dateUtcService = module.get(DateUtcService)
        gameplayMockUserService = module.get(GameplayMockUserService)
        gameplayConnectionService = module.get(GameplayConnectionService)
    })

    it("should grant gold reward when spinning", async () => {
        const spinSlotId = v4()
        const golds = 100

        jest.spyOn(service, "getRandomSlot").mockReturnValueOnce({
            id: spinSlotId,
            spinPrize: {
                type: SpinPrizeType.Gold,
                golds,
                appearanceChance: AppearanceChance.Common,
                id: v4(),
            }  
        })

        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().subtract(2, "day").toDate()
        })

        const { spinSlotId: responseSpinSlotId } = await service.spin({
            userId: user.id
        })

        const userAfter = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id }
        })

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
        const spinSlotId = v4()
        const tokens = 100
        jest.spyOn(service, "getRandomSlot").mockReturnValueOnce({
            id: spinSlotId,
            spinPrize: {
                type: SpinPrizeType.Token,
                tokens,
                appearanceChance: AppearanceChance.Common,
                id: v4(),
            }  
        })

        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().subtract(2, "day").toDate()
        })

        const { spinSlotId: responseSpinSlotId } = await service.spin({
            userId: user.id
        })

        const userAfter = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id }
        })

        expect(userAfter.tokens - user.tokens).toBe(tokens)
        expect(responseSpinSlotId).toBe(spinSlotId)  
    })

    it("should grant supply reward when spinning", async () => {
        const spinSlotId = v4()
        const quantity = 10

        jest.spyOn(service, "getRandomSlot").mockReturnValueOnce({
            id: spinSlotId,
            spinPrize: {
                type: SpinPrizeType.Supply,
                supplyId: SupplyId.BasicFertilizer,
                appearanceChance: AppearanceChance.Common,
                quantity,
                id: v4(),
            }  
        })

        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().subtract(2, "day").toDate()
        })

        const { spinSlotId: responseSpinSlotId } = await service.spin({
            userId: user.id
        })

        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Supply,
                    supplyId: SupplyId.BasicFertilizer
                }
            }
        })

        expect(inventory.quantity).toBe(quantity)
        expect(responseSpinSlotId).toBe(spinSlotId)  
    })

    it("should grant seed reward when spinning", async () => {
        const spinSlotId = v4()
        const quantity = 10
        const cropId = CropId.Carrot

        jest.spyOn(service, "getRandomSlot").mockReturnValueOnce({
            id: spinSlotId,
            spinPrize: {
                type: SpinPrizeType.Seed,
                cropId,
                appearanceChance: AppearanceChance.Common,
                quantity,
                id: v4(),
            }  
        })

        const user = await gameplayMockUserService.generate({
            spinLastTime: dateUtcService.getDayjs().subtract(2, "day").toDate()
        })

        const { spinSlotId: responseSpinSlotId } = await service.spin({
            userId: user.id
        })

        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Seed,
                    cropId
                }
            }
        })

        expect(inventory.quantity).toBe(quantity)
        expect(responseSpinSlotId).toBe(spinSlotId)  
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})

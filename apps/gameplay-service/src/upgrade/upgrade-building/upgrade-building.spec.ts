// import { Test } from "@nestjs/testing"
// import { BuildingSchema, getMongooseToken, PlacedItemSchema } from "@src/databases"
// import { UserInsufficientGoldException } from "@src/gameplay"
// import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
// import { Connection } from "mongoose"
// import {  GrpcNotFoundException } from "nestjs-grpc-exceptions"
// import { UpgradeBuildingService } from "./upgrade-building.service"

// describe("UpgradeBuildingService", () => {
//     let connection: Connection
//     let service: UpgradeBuildingService
//     let gameplayConnectionService: GameplayConnectionService
//     let gameplayMockUserService: GameplayMockUserService

//     beforeAll(async () => {
//         const moduleRef = await Test.createTestingModule({
//             imports: [TestingInfraModule.register()],
//             providers: [UpgradeBuildingService]
//         }).compile()

//         connection = moduleRef.get(getMongooseToken())
//         service = moduleRef.get(UpgradeBuildingService)
//         gameplayConnectionService = moduleRef.get(GameplayConnectionService)
//         gameplayMockUserService = moduleRef.get(GameplayMockUserService)
//     })

//     it("should successfully upgrade building", async () => {
//         const currentUpgrade = 0
//         const nextLevel = currentUpgrade + 1
        
//         const building = await connection.model<BuildingSchema>(BuildingSchema.name).findOne()
//         const user = await gameplayMockUserService.generate({ golds: building.upgradePrice + 10 })

//         const placedItemBuilding = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
//             userId: user.id,
//             placedItemType: "Building",
//             x: 0,
//             y: 0,
//             buildingInfo: { currentUpgrade: currentUpgrade }
//         })

//         await service.upgradeBuilding({
//             userId: user.id,
//             placedItemBuildingId: placedItemBuilding._id.toString()
//         })

//         const updatedPlacedItemBuilding = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemBuilding._id)
//         expect(updatedPlacedItemBuilding.buildingInfo.currentUpgrade).toBe(currentUpgrade + 1)
//     })

//     it("should throw GrpcNotFoundException when placed item is not found", async () => {
//         const user = await gameplayMockUserService.generate()
//         const invalidBuildingId = "invalid_building_id"

//         await expect(
//             service.upgradeBuilding({
//                 userId: user.id,
//                 placedItemBuildingId: invalidBuildingId
//             })
//         ).rejects.toThrow(GrpcNotFoundException)
//     })

//     it("should throw GrpcFailedPreconditionException when building is at max upgrade level", async () => {
//         const building = await connection.model<BuildingSchema>(BuildingSchema.name).findOne()
//         const user = await gameplayMockUserService.generate()

//         const placedItemBuilding = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
//             userId: user.id,
//             placedItemType: "Building",
//             x: 0,
//             y: 0,
//             buildingInfo: { currentUpgrade: building.maxUpgradeLevel }
//         })

//         await expect(
//             service.upgradeBuilding({
//                 userId: user.id,
//                 placedItemBuildingId: placedItemBuilding._id.toString()
//             })
//         ).rejects.toThrow(GrpcFailedPreconditionException)
//     })

//     it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
//         const building = await connection.model<BuildingSchema>(BuildingSchema.name).findOne()
//         const user = await gameplayMockUserService.generate({ golds: building.upgradePrice - 10 })

//         const placedItemBuilding = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
//             userId: user.id,
//             placedItemType: "Building",
//             x: 0,
//             y: 0,
//             buildingInfo: { currentUpgrade: 0 }
//         })

//         await expect(
//             service.upgradeBuilding({
//                 userId: user.id,
//                 placedItemBuildingId: placedItemBuilding._id.toString()
//             })
//         ).rejects.toThrow(UserInsufficientGoldException)
//     })

//     afterAll(async () => {
//         await gameplayMockUserService.clear()
//         await gameplayConnectionService.closeAll()
//         await connection.close()
//     })
// })

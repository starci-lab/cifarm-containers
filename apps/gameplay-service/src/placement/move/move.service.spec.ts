// import { Test, TestingModule } from "@nestjs/testing"
// import { PlacedItemEntity, UserEntity } from "@src/database"
// import { PlacedItemNotFoundException, UserNotFoundException } from "@src/exceptions"
// import { DataSource } from "typeorm"
// import MovePlacementRequest from "./placement-move.dto"
// import { PlacementMoveService } from "./placement-move.service"

// describe("PlacementMoveService", () => {
//     let service: PlacementMoveService
//     let dataSource: DataSource

//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 PlacementMoveService,
//                 {
//                     provide: DataSource,
//                     useValue: {
//                         createQueryRunner: jest.fn().mockReturnValue({
//                             connect: jest.fn(),
//                             startTransaction: jest.fn(),
//                             commitTransaction: jest.fn(),
//                             rollbackTransaction: jest.fn(),
//                             release: jest.fn(),
//                             manager: {
//                                 findOne: jest.fn(),
//                                 save: jest.fn()
//                             }
//                         })
//                     }
//                 }
//             ]
//         }).compile()

//         service = module.get<PlacementMoveService>(PlacementMoveService)
//         dataSource = module.get<DataSource>(DataSource) 
//     })

//     it("should be defined", () => {
//         expect(service).toBeDefined()
//     })

//     it("should move placement successfully", async () => {
//         const request: MovePlacementRequest = {
//             userId: "userKey",
//             placedItemKey: "key",
//             position: { x: 10, y: 20 }
//         }

//         const user = new UserEntity()
//         const placedItem = new PlacedItemEntity()

//         const queryRunner = dataSource.createQueryRunner() 
//         queryRunner.manager.findOne.mockResolvedValueOnce(user)
//         queryRunner.manager.findOne.mockResolvedValueOnce(placedItem)

//         await service.move(request)

//         expect(queryRunner.manager.save).toHaveBeenCalledWith(expect.objectContaining({
//             x: request.position.x,
//             y: request.position.y
//         }))
//         expect(queryRunner.commitTransaction).toHaveBeenCalled()
//     })

//     it("should throw UserNotFoundException if user is not found", async () => {
//         const request: MovePlacementRequest = {
//             userId: "userKey",
//             placedItemKey: "key",
//             position: { x: 10, y: 20 }
//         }

//         const queryRunner = dataSource.createQueryRunner()
//         queryRunner.manager.findOne.mockResolvedValueOnce(null)

//         await expect(service.move(request)).rejects.toThrow(UserNotFoundException)
//         expect(queryRunner.rollbackTransaction).toHaveBeenCalled()
//     })

//     it("should throw PlacedItemNotFoundException if placed item is not found", async () => {
//         const request: MovePlacementRequest = {
//             userId: "1",
//             placedItemKey: "1",
//             position: { x: 10, y: 20 }
//         }

//         const user = new UserEntity()

//         const queryRunner = dataSource.createQueryRunner()
//         queryRunner.manager.findOne.mockResolvedValueOnce(user)
//         queryRunner.manager.findOne.mockResolvedValueOnce(null)

//         await expect(service.move(request)).rejects.toThrow(PlacedItemNotFoundException)
//         expect(queryRunner.rollbackTransaction).toHaveBeenCalled()
//     })
// })

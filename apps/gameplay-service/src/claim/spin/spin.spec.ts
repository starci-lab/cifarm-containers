// // npx jest apps/gameplay-service/src/claim/spin/spin.spec.ts

// import { DataSource } from "typeorm"
// import { SpinService } from "./spin.service"
// import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
// import { Test } from "@nestjs/testing"

// describe("SpinService", () => {
//     let service: SpinService
//     let gameplayMockUserService: GameplayMockUserService
//     //let dataSource: DataSource
//     let connectionService: ConnectionService
    
//     beforeAll(async () => {
//         const moduleRef = await Test.createTestingModule({
//             imports: [
//                 TestingInfraModule.register()
//             ],
//             providers: [SpinService]
//         }).compile()
    
//         service = moduleRef.get(SpinService)
//         gameplayMockUserService = moduleRef.get(GameplayMockUserService)
//         //dataSource = moduleRef.get(DataSource)
//         connectionService = moduleRef.get(ConnectionService)
//     })

//     it("Should spin successfully", async () => {
//         //const user = await gameplayMockUserService.generate()
//         // Spin the wheel
//         // const response = await service.spin({
//         //     userId: user.id
//         // })

//         // // throw error if a spin is processed
//         // await expect(service.spin({
//         //     userId: user.id
//         // })).rejects.toThrow()

//         // Check
//     })

//     afterAll(async () => {
//         await gameplayMockUserService.clear()
//         await connectionService.closeAll()
//     })
// })

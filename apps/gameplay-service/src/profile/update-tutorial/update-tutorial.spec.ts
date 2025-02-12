// // npx jest apps/gameplay-service/src/profile/update-tutorial/update-tutorial.spec.ts

// import { Test } from "@nestjs/testing"
// import { DataSource } from "typeorm"
// import { UpdateTutorialService } from "./update-tutorial.service"
// import { UpdateTutorialRequest } from "./update-tutorial.dto"
// import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
// import { UserSchema, getPostgreSqlToken } from "@src/databases"

// describe("UpdateTutorialService", () => {
//     let service: UpdateTutorialService
//     let dataSource: DataSource
//     let gameplayMockUserService: GameplayMockUserService
//     let gameplayConnectionService: GameplayConnectionService

//     beforeAll(async () => {
//         const moduleRef = await Test.createTestingModule({
//             imports: [TestingInfraModule.register()],
//             providers: [UpdateTutorialService]
//         }).compile()

//         dataSource = moduleRef.get(getPostgreSqlToken())
//         service = moduleRef.get(UpdateTutorialService)
//         gameplayMockUserService = moduleRef.get(GameplayMockUserService)
//         gameplayConnectionService = moduleRef.get(GameplayConnectionService)
//     })

//     it("should successfully update tutorial for existing user", async () => {
//         const tutorialIndex = 2
//         const stepIndex = 5
//         const user = await gameplayMockUserService.generate() // Generate a user for testing

//         const request: UpdateTutorialRequest = {
//             userId: user.id,
//             tutorialIndex,
//             stepIndex
//         }

//         // Act: Call updateTutorial
//         await service.updateTutorial(request)

//         const updatedUser = await dataSource.manager.findOne(UserSchema, {
//             where: { id: user.id },
//             select: ["tutorialIndex", "stepIndex"]
//         })

//         expect(updatedUser.tutorialIndex).toBe(tutorialIndex)
//         expect(updatedUser.stepIndex).toBe(stepIndex)
//     })

//     afterAll(async () => {
//         await gameplayMockUserService.clear()
//         await gameplayConnectionService.closeAll()
//     })
// })

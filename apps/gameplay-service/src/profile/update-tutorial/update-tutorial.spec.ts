import { UserEntity } from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { UpdateTutorialRequest } from "./update-tutorial.dto"
import { UpdateTutorialModule } from "./update-tutorial.module"
import { UpdateTutorialService } from "./update-tutorial.service"

describe("UpdateTutorialService", () => {
    let dataSource: DataSource
    let service: UpdateTutorialService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [UpdateTutorialModule]
        })
        dataSource = ds
        service = module.get<UpdateTutorialService>(UpdateTutorialService)
    })

    it("Should successfully update tutorial for a user", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        // Insert user into the database
        const user = await queryRunner.manager.save(UserEntity, mockUser)

        await queryRunner.startTransaction()

        try {
            const request: UpdateTutorialRequest = {
                userId: user.id,
                tutorialIndex: 2,
                stepIndex: 5
            }

            // Perform update tutorial
            await service.updateTutorial(request)

            // Verify the user tutorial state
            const updatedUser = await queryRunner.manager.findOne(UserEntity, {
                where: { id: user.id }
            })

            expect(updatedUser.tutorialIndex).toBe(request.tutorialIndex)
            expect(updatedUser.stepIndex).toBe(request.stepIndex)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })

    afterAll(async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()
            await queryRunner.manager.delete(UserEntity, mockUser)
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})

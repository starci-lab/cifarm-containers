// npx jest apps/gameplay-service/src/claim/spin/spin.spec.ts

import {
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { SpinRequest } from "./spin.dto"
import { SpinModule } from "./spin.module"
import { SpinService } from "./spin.service"

describe("SpinService", () => {
    let dataSource: DataSource
    let service: SpinService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [SpinModule]
        })
        dataSource = ds
        service = module.get<SpinService>(SpinService)
    })

    it("Should spin successfully and reward gold", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        const user = await queryRunner.manager.save(UserEntity, {
            ...mockUser,
            spinLastTime: null,
            spinCount: 0
        })

        await queryRunner.startTransaction()

        try {
            const spinRequest: SpinRequest = {
                userId: user.id
            }

            // Perform spin
            const response = await service.spin(spinRequest)

            // Verify response
            expect(response.spinSlotId).toBeDefined()

            // Verify user's gold balance updated
            const updatedUser = await queryRunner.manager.findOne(UserEntity, {
                where: { id: user.id }
            })
            expect(updatedUser.spinLastTime).toBeDefined()
            expect(updatedUser.spinCount).toBe(1)

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

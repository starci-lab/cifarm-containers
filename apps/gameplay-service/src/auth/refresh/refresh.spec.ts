// npx jest apps/gameplay-service/src/auth/refresh/refresh.spec.ts

import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Test } from "@nestjs/testing"
import { isJWT, isUUID } from "class-validator"
import { RefreshService } from "./refresh.service"
import { getMongooseToken, SessionSchema, USER_COLLECTION } from "@src/databases"
import { Connection } from "mongoose"

describe("RefreshService", () => {
    let service: RefreshService
    let gameplayMockUserService: GameplayMockUserService
    let connection: Connection
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register()
            ],
            providers: [RefreshService]
        }).compile()

        service = moduleRef.get(RefreshService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        connection = moduleRef.get(getMongooseToken())
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should refresh user session and return valid access and refresh tokens", async () => {
        const user = await gameplayMockUserService.generate()
        const session = await connection.model<SessionSchema>(SessionSchema.name).findOne({ user: user.id }).populate("user")
        console.log(session)
        const { accessToken, refreshToken } = await service.refresh({
            refreshToken: session.refreshToken,
        })
        expect(isJWT(accessToken)).toBe(true)
        expect(isUUID(refreshToken)).toBe(true)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})

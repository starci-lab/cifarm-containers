// npx jest apps/gameplay-service/src/auth/refresh/refresh.spec.ts

import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Test } from "@nestjs/testing"
import { isJWT, isUUID } from "class-validator"
import { RefreshService } from "./refresh.service"
import { getPostgreSqlToken, SessionEntity } from "@src/databases"
import { DataSource } from "typeorm"

describe("RefreshService", () => {
    let service: RefreshService
    let gameplayMockUserService: GameplayMockUserService
    let dataSource: DataSource
    let connectionService: ConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register()
            ],
            providers: [RefreshService]
        }).compile()

        service = moduleRef.get(RefreshService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        dataSource = moduleRef.get(getPostgreSqlToken())
        connectionService = moduleRef.get(ConnectionService)
    })

    it("should refresh user session and return valid access and refresh tokens", async () => {
        const user = await gameplayMockUserService.generate()
        const session = await dataSource.manager.findOne(SessionEntity, {
            where: {
                userId: user.id
            }
        })
        const { accessToken, refreshToken } = await service.refresh({
            refreshToken: session.refreshToken,
            deviceInfo: {
                device: "device",
                os: "os",
                browser: "browser",
                ipV4: "127.0.0.1"
            }
        })
        expect(isJWT(accessToken)).toBe(true)
        expect(isUUID(refreshToken)).toBe(true)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})

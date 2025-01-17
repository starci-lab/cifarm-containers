import { GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Test } from "@nestjs/testing"
import { isJWT, isUUID } from "class-validator"
import { RefreshService } from "./refresh.service"
import { getPostgreSqlToken, UserEntity } from "@src/databases"
import { DataSource } from "typeorm"

describe("RefreshService", () => {
    let service: RefreshService
    let gameplayMockUserService: GameplayMockUserService
    let dataSource: DataSource
    let user: UserEntity

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register(),
            ],
            providers: [
                RefreshService,
            ]
        }).compile()

        service = moduleRef.get<RefreshService>(RefreshService)
        gameplayMockUserService = moduleRef.get<GameplayMockUserService>(GameplayMockUserService)
        dataSource = moduleRef.get<DataSource>(getPostgreSqlToken())
        user = await gameplayMockUserService.generate()
    })

    it("should refresh user session and return valid access and refresh tokens", async () => {
        const session = await dataSource.manager.findOne(UserEntity, {
            where: {
                id: user.id
            }
        })
        const { accessToken, refreshToken } = await service.refresh({
            refreshToken: session.sessions[0].refreshToken,
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
})

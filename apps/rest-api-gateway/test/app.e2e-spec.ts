import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { of } from "rxjs"
import * as request from "supertest"

const mockHealthcheckService = {
    doHealthcheck: jest.fn().mockReturnValue(of({ status: "ok" }))
}

// test

describe("RestApiGatewayController (e2e)", () => {
    let app: INestApplication

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                // ConfigModule.forRoot({
                //     load: [envConfig],
                //     isGlobal: true,
                // }),
                // TypeOrmModule.forRoot({
                //     type: "postgres",
                //     host: envConfig().database.postgres.gameplay.host,
                //     port: envConfig().database.postgres.gameplay.port,
                //     username: envConfig().database.postgres.gameplay.user,
                //     password: envConfig().database.postgres.gameplay.pass,
                //     database: envConfig().database.postgres.gameplay.dbName,
                //     autoLoadEntities: true,
                //     synchronize: true,
                // }),
            ]
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    it("/api/healthcheck (GET) - should return healthcheck status", async () => {
        const response = await request(app.getHttpServer()).get("/api/healthcheck").expect(200)

        expect(response.body).toEqual({ status: "ok" })
        expect(mockHealthcheckService.doHealthcheck).toHaveBeenCalled()
    })
})

import { Test, TestingModule } from "@nestjs/testing"
import { INestApplication } from "@nestjs/common"
import * as request from "supertest"
import { FarmingServiceModule } from "./../src/farming-service.module"

describe("FarmingServiceController (e2e)", () => {
    let app: INestApplication

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [FarmingServiceModule]
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })

    it("/ (GET)", () => {
        return request(app.getHttpServer()).get("/").expect(200).expect("Hello World!")
    })
})

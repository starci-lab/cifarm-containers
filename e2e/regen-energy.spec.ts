//npx jest --config ./e2e/jest.json ./e2e/regen-energy.spec.ts

import { Test } from "@nestjs/testing"
import {
    EnergyRegen,
    getPostgreSqlToken,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { ChainKey, Network } from "@src/env"
import {
    E2EAxiosService,
    E2EConnectionService,
    E2ERAuthenticationService,
    TEST_TIMEOUT,
    TestContext,
    TestingInfraModule
} from "@src/testing"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { Cache } from "cache-manager"
import { ENERGY_CACHE_SPEED_UP } from "@apps/cron-scheduler"
import { CACHE_MANAGER } from "@src/cache"
import { sleep } from "@src/common"

describe("Regen energy", () => {
    let dataSource: DataSource
    let e2eAxiosService: E2EAxiosService
    let e2eConnectionService: E2EConnectionService
    let e2eAuthenticationService: E2ERAuthenticationService
    let cacheManager: Cache
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                TestingInfraModule.register({
                    context: TestContext.E2E
                })
            ]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        e2eAxiosService = moduleRef.get(E2EAxiosService)
        e2eConnectionService = moduleRef.get(E2EConnectionService)
        e2eAuthenticationService = moduleRef.get(E2ERAuthenticationService)
        cacheManager = moduleRef.get(CACHE_MANAGER)
    })

    it(
        "sould energy regen successfully",
        async () => {
            // Create session
            const name = v4()
            e2eAxiosService.create(name)
            const user = await e2eAuthenticationService.authenticate({
                name,
                accountNumber: 8,
                chainKey: ChainKey.Solana,
                network: Network.Testnet
            })
            dataSource.manager.update(UserEntity, user.id, {
                energyFull: false,
                energy: 0
            })
            const { value } = await dataSource.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.EnergyRegen
                }
            })
            const { time: energyRegenTime } = value as EnergyRegen

            for (let i = 0; i < 10; i++) {
                await cacheManager.set(ENERGY_CACHE_SPEED_UP, {
                    time: energyRegenTime
                })
                await sleep(1100)
                const userAfter = await dataSource.manager.findOne(UserEntity, {
                    where: {
                        id: user.id
                    }
                })
                expect(userAfter.energy).toBe(i+1)
            }
        },
        TEST_TIMEOUT
    )

    afterAll(async () => {
        await e2eAuthenticationService.clear()
        await e2eConnectionService.closeAll()
    })
})

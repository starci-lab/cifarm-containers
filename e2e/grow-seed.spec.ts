//npx jest --config ./e2e/jest.json ./e2e/grow-seed.spec.ts

import { BuySeedsRequest, BuySeedsResponse, PlantSeedRequest, PlantSeedResponse } from "@apps/gameplay-service"
import { HttpStatus } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import {
    CropEntity,
    getPostgreSqlToken,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    PlacedItemTypeId,
} from "@src/databases"
import { ChainKey, Network } from "@src/env"
import {
    AxiosType,
    E2EAxiosService,
    E2EConnectionService,
    E2ERAuthenticationService,
    TEST_TIMEOUT,
    TestContext,
    TestingInfraModule
} from "@src/testing"
import { getSocketIoToken } from "@src/testing/infra/e2e/socket-io"
import { AxiosResponse } from "axios"
import { isUUID } from "class-validator"
import { Socket } from "socket.io-client"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { Cache } from "cache-manager"
import { CACHE_SPEED_UP, CacheSpeedUpData } from "@apps/cron-scheduler"
import { CACHE_MANAGER } from "@src/cache"
import { sleep } from "@src/common"

describe("Grow seed flow", () => {
    let dataSource: DataSource
    let e2eAxiosService: E2EAxiosService
    let e2eConnectionService: E2EConnectionService
    let e2eAuthenticationService: E2ERAuthenticationService
    let socket: Socket
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
        socket = moduleRef.get(getSocketIoToken())
        cacheManager = moduleRef.get(CACHE_MANAGER)
    })

    it("should grow seed successfully in one crop season", async () => {
        // Test with carrot, one crop season
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: {
                perennialCount: 1
            }
        })

        // Create auth session
        const name = v4()
        e2eAxiosService.create(name)
        const user = await e2eAuthenticationService.authenticate({
            name,
            accountNumber: 8,
            chainKey: ChainKey.Solana,
            network: Network.Testnet
        })
        const authAxios = e2eAxiosService.getAxios(name, AxiosType.Auth)
        // Buy the seed
        const buySeedsResponse = await authAxios.post<
            BuySeedsResponse,
            AxiosResponse<BuySeedsResponse, Omit<BuySeedsRequest, "userId">>,
            Omit<BuySeedsRequest, "userId">
        >("gameplay/buy-seeds", {
            cropId: crop.id,
            quantity: 1
        })
        expect(buySeedsResponse.status).toBe(HttpStatus.CREATED)

        // Get the inventory
        const inventorySeed = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Seed,
                    cropId: crop.id
                }
            },
            relations: {
                inventoryType: true
            }
        })
        expect(isUUID(inventorySeed.id)).toBeTruthy()

        const placedItemStarterTile = await dataSource.manager.findOne(PlacedItemEntity, {
            where: {
                userId: user.id,
                placedItemTypeId: PlacedItemTypeId.StarterTile
            }
        })
        // Plant the seed
        const plantSeedResponse = await authAxios.post<
            PlantSeedResponse,
            AxiosResponse<BuySeedsResponse, Omit<PlantSeedRequest, "userId">>,
            Omit<PlantSeedRequest, "userId">
        >("gameplay/plant-seed", {
            inventorySeedId: inventorySeed.id,
            placedItemTileId: placedItemStarterTile.id
        })
        expect(plantSeedResponse.status).toBe(HttpStatus.CREATED)

        // Time speed up
        await cacheManager.set<CacheSpeedUpData>(CACHE_SPEED_UP, {
            //plus 1 to ensure the crop is grow into the next stage
            time: crop.growthStageDuration + 1
        })

        // Sleep 1.1s to let cron job run
        await sleep(1100)

    }, TEST_TIMEOUT)

    afterAll(async () => {
        await e2eAuthenticationService.clear()
        await e2eConnectionService.closeAll()
    })
})

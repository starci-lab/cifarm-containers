//npx jest --config ./e2e/jest.json ./e2e/thief-crop.spec.ts

import {
    BuySeedsRequest,
    BuySeedsResponse,
    HelpUseHerbicideRequest,
    HelpUseHerbicideResponse,
    HelpUsePesticideRequest,
    HelpUsePesticideResponse,
    HelpWaterRequest,
    HelpWaterResponse,
    PlantSeedRequest,
    PlantSeedResponse,
    ThiefCropRequest,
    ThiefCropResponse,
} from "@apps/gameplay-service"
import { HttpStatus } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import {
    CropCurrentState,
    CropEntity,
    getPostgreSqlToken,
    InventoryEntity,
    InventoryType,
    PlacedItemSchema,
    PlacedItemTypeId
} from "@src/databases"
import { ChainKey, Network } from "@src/env"
import {
    E2EAxiosService,
    E2EConnectionService,
    E2ERAuthenticationService,
    TEST_TIMEOUT,
    TestContext,
    TestingInfraModule,
    E2EGameplaySocketIoService
} from "@src/testing"
import { AxiosResponse } from "axios"
import { isUUID } from "class-validator"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { Cache } from "cache-manager"
import { CROP_CACHE_SPEED_UP, CropCacheSpeedUpData } from "@apps/cron-scheduler"
import { CACHE_MANAGER } from "@src/cache"
import { sleep } from "@src/common"
import { PlacedItemsSyncedMessage, PLACED_ITEMS_SYNCED_EVENT } from "@apps/io-gameplay"

describe("Thief crop flow", () => {
    let dataSource: DataSource
    let e2eAxiosService: E2EAxiosService
    let e2eConnectionService: E2EConnectionService
    let e2eAuthenticationService: E2ERAuthenticationService
    let e2eGameplaySocketIoService: E2EGameplaySocketIoService
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
        e2eGameplaySocketIoService = moduleRef.get(E2EGameplaySocketIoService)
        cacheManager = moduleRef.get(CACHE_MANAGER)
    })

    it("should thief successfully",
        async () => {
            const messageRecorder: Record<string, Array<unknown>> = {}

            // Create auth session
            const name = v4()
            const { authAxios } = e2eAxiosService.create(name)
            const user = await e2eAuthenticationService.authenticate({
                name,
                accountNumber: 8,
                chainKey: ChainKey.Solana,
                network: Network.Testnet
            })
            const { createSocket } = await e2eGameplaySocketIoService.create(name)
            const gameplayNsSocketId = v4()
            const socket = createSocket(gameplayNsSocketId, ["/gameplay"])
            socket.on("connect", () => {
                console.log(`User ${user.id} connected to gameplay namespace`)
            })
            socket.on(PLACED_ITEMS_SYNCED_EVENT, (data: PlacedItemsSyncedMessage) => {
                if (!messageRecorder[PLACED_ITEMS_SYNCED_EVENT]) {
                    messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []
                }
                messageRecorder[PLACED_ITEMS_SYNCED_EVENT].push(data)
            })
            socket.connect()
            // At the start, we try to sleep 0.5s to ensure no message is transmitted via a visitor
            await sleep(500)
            expect(messageRecorder[PLACED_ITEMS_SYNCED_EVENT]).toBeUndefined()

            // Create vistor auth session
            const visitorName = v4()
            const { authAxios: visitorAuthAxios } = e2eAxiosService.create(visitorName)
            const visitorUser = await e2eAuthenticationService.authenticate({
                name: visitorName,
                accountNumber: 9,
                chainKey: ChainKey.Solana,
                network: Network.Testnet
            })
            const { createSocket: createVisitorSocket } =
                await e2eGameplaySocketIoService.create(visitorName)
            const visitorGameplayNsSocketId = v4()
            const visitorSocket = createVisitorSocket(visitorGameplayNsSocketId, ["/gameplay"])
            visitorSocket.on("connect", () => {
                console.log(`User ${visitorUser.id} connected to gameplay namespace`)
                visitorSocket.emit("visit", {
                    userId: user.id
                })
            })
            visitorSocket.on(PLACED_ITEMS_SYNCED_EVENT, (data: PlacedItemsSyncedMessage) => {
                if (!messageRecorder[PLACED_ITEMS_SYNCED_EVENT]) {
                    messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []
                }
                messageRecorder[PLACED_ITEMS_SYNCED_EVENT].push(data)
            })
            visitorSocket.connect()
            // At the start, we try to sleep 0.5s to ensure 1 message is transmitted via a visitor
            await sleep(500)
            expect(messageRecorder[PLACED_ITEMS_SYNCED_EVENT].length).toBe(1)
            expect(
                (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][0] as PlacedItemsSyncedMessage).userId
            ).toBe(user.id)
            messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []

            // Test with carrot, one crop season
            const crop = await dataSource.manager.findOne(CropEntity, {
                where: {
                    perennialCount: 1
                }
            })

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

            const placedItemStarterTile = await dataSource.manager.findOne(PlacedItemSchema, {
                where: {
                    userId: user.id,
                    placedItemTypeId: PlacedItemTypeId.BasicTile
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

            //sleep 0.5s to ensure message are transmitted via Kafka, now we have 2 listeners
            await sleep(500)
            // ensure message are transmitted via Kafka, now we have 2 listeners, so that we expect 2 messages in the recorder
            expect(messageRecorder[PLACED_ITEMS_SYNCED_EVENT].length).toBe(2)
            expect(
                (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][0] as PlacedItemsSyncedMessage).userId
            ).toBe(user.id)
            expect(
                (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][1] as PlacedItemsSyncedMessage).userId
            ).toBe(user.id)
            messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []

            // Time speed up
            await cacheManager.set<CropCacheSpeedUpData>(CROP_CACHE_SPEED_UP, {
                //plus 1 to ensure the crop is grow into the next stage
                time: crop.growthStageDuration
            })
            // Sleep 1.1s to let cron job run
            await sleep(1100)

            const placedItemStarterTileAfterFirstGrow = await dataSource.manager.findOne(
                PlacedItemSchema,
                {
                    where: {
                        id: placedItemStarterTile.id
                    },
                    relations: {
                        cropInfo: true
                    }
                }
            )
            expect(placedItemStarterTileAfterFirstGrow.cropInfo.currentStage).toBe(1)

            // check whether the crop is need watered
            if (
                placedItemStarterTileAfterFirstGrow.cropInfo.currentState ===
                CropCurrentState.NeedWater
            ) {
                // Water the crop
                const helpWaterResponse = await visitorAuthAxios.post<
                    HelpWaterResponse,
                    AxiosResponse<HelpWaterResponse, Omit<HelpWaterRequest, "userId">>,
                    Omit<HelpWaterRequest, "userId">
                >("gameplay/help-water", {
                    placedItemTileId: placedItemStarterTile.id,
                    neighborUserId: user.id
                })
                expect(helpWaterResponse.status).toBe(HttpStatus.OK)

                //sleep 0.5s to ensure message are transmitted via Kafka, now we have 2 listeners
                await sleep(500)
                // ensure message are transmitted via Kafka, now we have 2 listeners, so that we expect 2 messages in the recorder
                expect(messageRecorder[PLACED_ITEMS_SYNCED_EVENT].length).toBe(2)
                expect(
                    (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][0] as PlacedItemsSyncedMessage)
                        .userId
                ).toBe(user.id)
                expect(
                    (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][1] as PlacedItemsSyncedMessage)
                        .userId
                ).toBe(user.id)
                messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []
            }

            // Time speed up
            await cacheManager.set<CropCacheSpeedUpData>(CROP_CACHE_SPEED_UP, {
                //plus 1 to ensure the crop is grow into the next stage
                time: crop.growthStageDuration
            })
            // Sleep 1.1s to let cron job run
            await sleep(1100)

            const placedItemStarterTileAfterSecondGrow = await dataSource.manager.findOne(
                PlacedItemSchema,
                {
                    where: {
                        id: placedItemStarterTile.id
                    },
                    relations: {
                        cropInfo: true
                    }
                }
            )
            expect(placedItemStarterTileAfterSecondGrow.cropInfo.currentStage).toBe(2)

            // check whether the crop is need watered
            if (
                placedItemStarterTileAfterSecondGrow.cropInfo.currentState ===
                CropCurrentState.NeedWater
            ) {
                // Water the crop
                const helpWaterResponse = await visitorAuthAxios.post<
                    HelpWaterResponse,
                    AxiosResponse<HelpWaterResponse, Omit<HelpWaterRequest, "userId">>,
                    Omit<HelpWaterRequest, "userId">
                >("gameplay/help-water", {
                    placedItemTileId: placedItemStarterTile.id,
                    neighborUserId: user.id
                })
                expect(helpWaterResponse.status).toBe(HttpStatus.OK)

                //sleep 0.5s to ensure message are transmitted via Kafka, now we have 2 listeners
                await sleep(500)
                // ensure message are transmitted via Kafka, now we have 2 listeners, so that we expect 2 messages in the recorder
                expect(messageRecorder[PLACED_ITEMS_SYNCED_EVENT].length).toBe(2)
                expect(
                    (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][0] as PlacedItemsSyncedMessage)
                        .userId
                ).toBe(user.id)
                expect(
                    (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][1] as PlacedItemsSyncedMessage)
                        .userId
                ).toBe(user.id)
                messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []
            }

            // Time speed up
            await cacheManager.set<CropCacheSpeedUpData>(CROP_CACHE_SPEED_UP, {
                //plus 1 to ensure the crop is grow into the next stage
                time: crop.growthStageDuration
            })
            // Sleep 1.1s to let cron job run
            await sleep(1100)

            const placedItemStarterTileAfterThirdGrow = await dataSource.manager.findOne(
                PlacedItemSchema,
                {
                    where: {
                        id: placedItemStarterTile.id
                    },
                    relations: {
                        cropInfo: true
                    }
                }
            )
            expect(placedItemStarterTileAfterThirdGrow.cropInfo.currentStage).toBe(3)

            // check whether the crop is weedy or infested
            if (
                placedItemStarterTileAfterThirdGrow.cropInfo.currentState ===
                CropCurrentState.IsWeedy
            ) {
                // use herbicide on the crop
                const helpUseHerbicideResponse = await visitorAuthAxios.post<
                    HelpUseHerbicideResponse,
                    AxiosResponse<
                        HelpUseHerbicideResponse,
                        Omit<HelpUseHerbicideRequest, "userId">
                    >,
                    Omit<HelpUseHerbicideRequest, "userId">
                >("gameplay/help-use-herbicide", {
                    placedItemTileId: placedItemStarterTile.id,
                    neighborUserId: user.id
                })
                expect(helpUseHerbicideResponse.status).toBe(HttpStatus.OK)

                //sleep 0.5s to ensure message are transmitted via Kafka, now we have 2 listeners
                await sleep(500)
                // ensure message are transmitted via Kafka, now we have 2 listeners, so that we expect 2 messages in the recorder
                expect(messageRecorder[PLACED_ITEMS_SYNCED_EVENT].length).toBe(2)
                expect(
                    (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][0] as PlacedItemsSyncedMessage)
                        .userId
                ).toBe(user.id)
                expect(
                    (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][1] as PlacedItemsSyncedMessage)
                        .userId
                ).toBe(user.id)
                messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []
            }

            if (
                placedItemStarterTileAfterThirdGrow.cropInfo.currentState ===
                CropCurrentState.IsInfested
            ) {
                // use pesticide on the crop
                const helpUsePestisideResponse = await visitorAuthAxios.post<
                    HelpUsePesticideResponse,
                    AxiosResponse<HelpUsePesticideResponse, Omit<HelpUsePesticideRequest, "userId">>,
                    Omit<HelpUsePesticideRequest, "userId">
                >("gameplay/help-use-pesticide", {
                    placedItemTileId: placedItemStarterTile.id,
                    neighborUserId: user.id
                })
                expect(helpUsePestisideResponse.status).toBe(HttpStatus.OK)

                //sleep 0.5s to ensure message are transmitted via Kafka, now we have 2 listeners
                await sleep(500)
                // ensure message are transmitted via Kafka, now we have 2 listeners, so that we expect 2 messages in the recorder
                expect(messageRecorder[PLACED_ITEMS_SYNCED_EVENT].length).toBe(2)
                expect(
                    (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][0] as PlacedItemsSyncedMessage)
                        .userId
                ).toBe(user.id)
                expect(
                    (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][1] as PlacedItemsSyncedMessage)
                        .userId
                ).toBe(user.id)
                messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []
            }

            // Time speed up
            await cacheManager.set<CropCacheSpeedUpData>(CROP_CACHE_SPEED_UP, {
                //plus 1 to ensure the crop is grow into the next stage
                time: crop.growthStageDuration
            })
            // Sleep 1.1s to let cron job run
            await sleep(1100)

            const placedItemStarterTileFullyHarvest = await dataSource.manager.findOne(
                PlacedItemSchema,
                {
                    where: {
                        id: placedItemStarterTile.id
                    },
                    relations: {
                        cropInfo: true
                    }
                }
            )

            expect(placedItemStarterTileFullyHarvest.cropInfo.currentStage).toBe(4)
            expect(placedItemStarterTileFullyHarvest.cropInfo.currentState).toBe(
                CropCurrentState.FullyMatured
            )

            // harvest the crop
            const thiefCropResponse = await visitorAuthAxios.post<
                ThiefCropResponse,
                AxiosResponse<ThiefCropResponse, Omit<ThiefCropRequest, "userId">>,
                Omit<ThiefCropRequest, "userId">
            >("gameplay/thief-crop", {
                placedItemTileId: placedItemStarterTile.id,
                neighborUserId: user.id
            })
            expect(thiefCropResponse.status).toBe(HttpStatus.CREATED)

            //sleep 0.5s to ensure message are transmitted via Kafka, now we have 2 listeners
            await sleep(500)
            // ensure message are transmitted via Kafka, now we have 2 listeners, so that we expect 2 messages in the recorder
            expect(messageRecorder[PLACED_ITEMS_SYNCED_EVENT].length).toBe(2)
            expect(
                (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][0] as PlacedItemsSyncedMessage).userId
            ).toBe(user.id)
            expect(
                (messageRecorder[PLACED_ITEMS_SYNCED_EVENT][1] as PlacedItemsSyncedMessage).userId
            ).toBe(user.id)
            messageRecorder[PLACED_ITEMS_SYNCED_EVENT] = []
        },
        TEST_TIMEOUT
    )

    afterAll(async () => {
        await e2eAuthenticationService.clear()
        await e2eConnectionService.closeAll()
    })
})

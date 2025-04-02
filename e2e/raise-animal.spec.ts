// npx jest --config ./e2e/jest.json ./e2e/raise-animal.spec.ts

import {
    BuyAnimalRequest,
    BuyAnimalResponse,
    BuySuppliesRequest,
    BuySuppliesResponse,
    HarvestAnimalRequest,
    HarvestAnimalResponse,
    BuyBuildingRequest,
    BuyBuildingResponse,
    CureAnimalRequest,
    CureAnimalResponse,
    FeedAnimalRequest,
    FeedAnimalResponse
} from "@apps/gameplay-service"
import { PLACED_ITEMS_SYNCED_EVENT, PlacedItemsSyncedMessage } from "@apps/ws"
import { Test } from "@nestjs/testing"
import { CACHE_MANAGER } from "@src/cache"
import { sleep } from "@src/common"
import {
    AnimalCurrentState,
    AnimalEntity,
    AnimalId,
    BuildingEntity,
    BuildingId,
    getPostgreSqlToken,
    PlacedItemSchema,
    PlacedItemType,
    SupplyEntity,
    SupplyId,
    UserSchema
} from "@src/databases"
import { ChainKey, Network } from "@src/env"
import {
    E2EAxiosService,
    E2EConnectionService,
    E2ERAuthenticationService,
    E2EGameplaySocketIoService,
    TestingInfraModule,
    TestContext
} from "@src/testing"
import { AxiosResponse } from "axios"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { Cache } from "cache-manager"
import { ANIMAL_CACHE_SPEED_UP } from "@apps/cron-scheduler"
import { HttpStatus } from "@nestjs/common"

describe("Raise animal flow", () => {
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

    it("Should raise animal successfully", async () => {
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
        e2eAxiosService.create(visitorName)
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

        // Get the building
        const building = await dataSource.manager.findOne(BuildingEntity, {
            where: {
                id: BuildingId.Coop
            }
        })
        // Get the animal
        const animal = await dataSource.manager.findOne(AnimalEntity, {
            where: {
                id: AnimalId.Chicken
            }
        })
        // Get the animal feed
        const supplyAnimalFeed = await dataSource.manager.findOne(SupplyEntity, {
            where: {
                id: SupplyId.AnimalFeed
            }
        })

        //add more gold to user
        await dataSource.manager.update(UserSchema, user.id, {
            golds: building.price + animal.price + 100 * supplyAnimalFeed.price + 10
        })

        // Construct a building
        const constructBuilding = await authAxios.post<
            BuyBuildingResponse,
            AxiosResponse<BuyBuildingResponse, Omit<BuyBuildingRequest, "userId">>,
            Omit<BuyBuildingRequest, "userId">
        >("gameplay/construct-building", {
            buildingId: BuildingId.Coop,
            position: {
                x: 0,
                y: 0
            }
        })
        expect(constructBuilding.status).toBe(HttpStatus.CREATED)
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

        // coop is constructed, now place an animal
        const placedItemBuildingCoop = await dataSource.manager.findOne(PlacedItemSchema, {
            where: {
                userId: user.id,
                placedItemTypeId: BuildingId.Coop
            }
        })

        // Purchase from shop
        const buyAnimalResponse = await authAxios.post<
            BuyAnimalResponse,
            AxiosResponse<BuyAnimalResponse, Omit<BuyAnimalRequest, "userId">>,
            Omit<BuyAnimalRequest, "userId">
        >("gameplay/buy-animal", {
            animalId: animal.id,
            placedItemBuildingId: placedItemBuildingCoop.id,
            position: {
                x: 3,
                y: 3
            }
        })
        expect(buyAnimalResponse.status).toBe(HttpStatus.CREATED)
        // At the start, we try to sleep 0.5s to ensure 1 message is transmitted via a visitor
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

        const { id: placedItemAnimalId } = await dataSource.manager.findOne(PlacedItemSchema, {
            where: {
                userId: user.id,
                placedItemType: {
                    animalId: animal.id,
                    type: PlacedItemType.Animal
                }
            },
            select: ["id"]
        })

        //use while loop to feed the animal until it grows up
        for (;;) {
            //e2e speed up the animal hunger time
            await cacheManager.set(ANIMAL_CACHE_SPEED_UP, {
                time: animal.hungerTime
            })
            //sleep 1.1s to wait for the animal to be hungry
            await sleep(1100)

            const placedItemAnimal = await dataSource.manager.findOne(PlacedItemSchema, {
                where: {
                    id: placedItemAnimalId
                },
                relations: {
                    animalInfo: true
                }
            })

            // if animal is adult, break the loop
            if (placedItemAnimal.animalInfo.isAdult) {
                break
            }

            //buy supply animal feed
            const buySuppliesResponse = await authAxios.post<
                BuySuppliesResponse,
                AxiosResponse<BuySuppliesResponse, Omit<BuySuppliesRequest, "userId">>,
                Omit<BuySuppliesRequest, "userId">
            >("gameplay/buy-supplies", {
                supplyId: SupplyId.AnimalFeed,
                quantity: 1
            })
            expect(buySuppliesResponse.status).toBe(HttpStatus.CREATED)

            //feed the animal
            const feedAnimalResponse = await authAxios.post<
                FeedAnimalResponse,
                AxiosResponse<FeedAnimalResponse, Omit<FeedAnimalRequest, "userId">>,
                Omit<FeedAnimalRequest, "userId">
            >("gameplay/feed-animal", {
                placedItemAnimalId
            })

            expect(feedAnimalResponse.status).toBe(HttpStatus.OK)
            // At the start, we try to sleep 0.5s to ensure 1 message is transmitted via a visitor
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
        }

        const placedItemAnimalAdult = await dataSource.manager.findOne(PlacedItemSchema, {
            where: {
                id: placedItemAnimalId
            },
            relations: {
                animalInfo: true
            }
        })
        //expect the animal to be adult
        expect(placedItemAnimalAdult.animalInfo.isAdult).toBe(true)
        //buy supply animal feed again
        //buy supply animal feed
        const buySuppliesResponse = await authAxios.post<
            BuySuppliesResponse,
            AxiosResponse<BuySuppliesResponse, Omit<BuySuppliesRequest, "userId">>,
            Omit<BuySuppliesRequest, "userId">
        >("gameplay/buy-supplies", {
            supplyId: SupplyId.AnimalFeed,
            quantity: 1
        })
        expect(buySuppliesResponse.status).toBe(HttpStatus.CREATED)
        //feed the animal again
        const feedAnimalResponse = await authAxios.post<
            FeedAnimalResponse,
            AxiosResponse<FeedAnimalResponse, Omit<FeedAnimalRequest, "userId">>,
            Omit<FeedAnimalRequest, "userId">
        >("gameplay/feed-animal", {
            placedItemAnimalId
        })
        expect(feedAnimalResponse.status).toBe(HttpStatus.OK)
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

        //fast-forward half of the yield time
        await cacheManager.set(ANIMAL_CACHE_SPEED_UP, {
            time: Math.ceil(animal.yieldTime / 2)
        })
        //sleep 1.1s to wait for the animal to grow, either check it will sick or not
        await sleep(1100)

        const placedItemAnimalWillSick = await dataSource.manager.findOne(PlacedItemSchema, {
            where: {
                id: placedItemAnimalId
            },
            relations: {
                animalInfo: true
            }
        })
        // expect the animal to be immunized
        expect(placedItemAnimalWillSick.animalInfo.immunized).toBe(true)
        // handle case the animal is sick
        if (placedItemAnimalWillSick.animalInfo.currentState === AnimalCurrentState.Sick) {
            //cure the animal
            const cureAnimalResponse = await authAxios.post<
                CureAnimalResponse,
                AxiosResponse<CureAnimalResponse, Omit<CureAnimalRequest, "userId">>,
                Omit<CureAnimalRequest, "userId">
            >("gameplay/cure-animal", {
                placedItemAnimalId
            })
            expect(cureAnimalResponse.status).toBe(HttpStatus.OK)
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
        }
        //fast-forward the rest of the yield time
        await cacheManager.set(ANIMAL_CACHE_SPEED_UP, {
            time: Math.ceil(animal.yieldTime / 2)
        })
        //sleep 1.1s to wait for the animal to yield
        await sleep(1100)
        //collect animal product
        const harvestAnimalResponse = await authAxios.post<
            HarvestAnimalResponse,
            AxiosResponse<
                HarvestAnimalResponse,
                Omit<HarvestAnimalRequest, "userId">
            >,
            Omit<HarvestAnimalRequest, "userId">
        >("gameplay/harvest-animal", {
            placedItemAnimalId
        })
        expect(harvestAnimalResponse.status).toBe(HttpStatus.CREATED)

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
    })

    afterAll(async () => {
        await e2eAuthenticationService.clear()
        await e2eConnectionService.closeAll()
    })
})

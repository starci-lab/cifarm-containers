import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import {
    AnimalEntity,
    AnimalId,
    BuildingEntity,
    BuildingId,
    PlacedItemEntity,
    UserEntity
} from "@src/database"
import { GoldBalanceService } from "@src/services"
import * as path from "path"
import { DataSource, DeepPartial } from "typeorm"
import {
    ConstructBuildingModule,
    ConstructBuildingRequest,
    ConstructBuildingResponse,
    ConstructBuildingService
} from "../construct-building"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"
import { BuyAnimalModule } from "./buy-animal.module"
import { BuyAnimalService } from "./buy-animal.service"
import { BuildingNotSameAnimalException, UserInsufficientGoldException } from "@src/exceptions"

describe("BuyAnimalService", () => {
    let dataSource: DataSource
    let buyAnimalService: BuyAnimalService
    let constructBuildingService: ConstructBuildingService

    // Test users
    const users: Array<DeepPartial<UserEntity>> = [
        {
            username: "test_user_1",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 10000
        },
        {
            username: "test_user_2",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 10000
        },
        {
            username: "test_user_3",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 3100
        },
        {
            username: "test_user_4",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 10000
        }
    ]

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: path.join(process.cwd(), ".env.local"),
                    isGlobal: true
                }),
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().database.postgres.gameplay.test.host,
                    port: envConfig().database.postgres.gameplay.test.port,
                    username: envConfig().database.postgres.gameplay.test.user,
                    password: envConfig().database.postgres.gameplay.test.pass,
                    database: envConfig().database.postgres.gameplay.test.dbName,
                    autoLoadEntities: true,
                    synchronize: true
                }),
                BuyAnimalModule,
                ConstructBuildingModule
            ],
            providers: [GoldBalanceService]
        }).compile()

        dataSource = module.get(DataSource)
        buyAnimalService = module.get(BuyAnimalService)
        constructBuildingService = module.get(ConstructBuildingService)
    })
    it("Should construct a building and successfully buy animals for it", async () => {
        const userBeforeWorkflow = await dataSource.manager.save(UserEntity, users[0])

        // Step 1: Construct a building
        const building = await dataSource.manager.findOneOrFail(BuildingEntity, {
            where: { id: BuildingId.Pasture, availableInShop: true }
        })

        const constructBuildingRequest: ConstructBuildingRequest = {
            buildingId: building.id,
            userId: userBeforeWorkflow.id,
            position: { x: 5, y: 5 }
        }

        const constructResponse: ConstructBuildingResponse =
            await constructBuildingService.constructBuilding(constructBuildingRequest)

        // Verify building was constructed
        const placedBuilding = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: constructResponse.placedItemId, userId: userBeforeWorkflow.id },
            relations: { buildingInfo: true }
        })

        expect(placedBuilding).toBeDefined()
        expect(placedBuilding.buildingInfo.buildingId).toBe(building.id)

        // Step 2: Buy animals for the constructed building
        const animal = await dataSource.manager.findOneOrFail(AnimalEntity, {
            where: { id: AnimalId.Cow, availableInShop: true }
        })

        const buyAnimalRequest: BuyAnimalRequest = {
            animalId: animal.id,
            userId: userBeforeWorkflow.id,
            placedItemBuildingId: constructResponse.placedItemId,
            position: { x: 10, y: 10 }
        }

        const buyAnimalResponse: BuyAnimalResponse =
            await buyAnimalService.buyAnimal(buyAnimalRequest)

        // Verify animal was bought
        const placedAnimal = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: buyAnimalResponse.placedItemId, userId: userBeforeWorkflow.id },
            relations: { animalInfo: true }
        })

        expect(placedAnimal).toBeDefined()
        expect(placedAnimal.animalInfo.animalId).toBe(animal.id)

        // Verify building occupancy
        const updatedBuilding = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: constructResponse.placedItemId },
            relations: { buildingInfo: true }
        })

        expect(updatedBuilding.buildingInfo.occupancy).toBe(1)
    })

    it("Should buy two same animals successfully", async () => {
        const userBeforeWorkflow = await dataSource.manager.save(UserEntity, users[1])

        // Step 1: Construct a building
        const building = await dataSource.manager.findOneOrFail(BuildingEntity, {
            where: { id: BuildingId.Pasture, availableInShop: true }
        })

        const constructBuildingRequest: ConstructBuildingRequest = {
            buildingId: building.id,
            userId: userBeforeWorkflow.id,
            position: { x: 5, y: 5 }
        }

        const constructResponse: ConstructBuildingResponse =
            await constructBuildingService.constructBuilding(constructBuildingRequest)

        // Step 2: Buy the first animal
        const animalFirst = await dataSource.manager.findOneOrFail(AnimalEntity, {
            where: { id: AnimalId.Cow, availableInShop: true }
        })

        const buyAnimalRequest1: BuyAnimalRequest = {
            animalId: animalFirst.id,
            userId: userBeforeWorkflow.id,
            placedItemBuildingId: constructResponse.placedItemId,
            position: { x: 10, y: 10 }
        }

        const buyAnimalResponse1: BuyAnimalResponse =
            await buyAnimalService.buyAnimal(buyAnimalRequest1)

        // Verify first animal
        const placedAnimalFirst = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: buyAnimalResponse1.placedItemId, userId: userBeforeWorkflow.id },
            relations: { animalInfo: true }
        })

        expect(placedAnimalFirst).toBeDefined()
        expect(placedAnimalFirst.animalInfo.animalId).toBe(animalFirst.id)

        // Step 3: Buy the second animal
        const animalSecond = await dataSource.manager.findOneOrFail(AnimalEntity, {
            where: { id: AnimalId.Cow, availableInShop: true }
        })

        const buyAnimalRequestSecond: BuyAnimalRequest = {
            animalId: animalSecond.id,
            userId: userBeforeWorkflow.id,
            placedItemBuildingId: constructResponse.placedItemId,
            position: { x: 15, y: 15 }
        }

        const buyAnimalResponse2: BuyAnimalResponse =
            await buyAnimalService.buyAnimal(buyAnimalRequestSecond)

        // Verify second animal
        const placedAnimalSecond = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: buyAnimalResponse2.placedItemId, userId: userBeforeWorkflow.id },
            relations: { animalInfo: true }
        })

        expect(placedAnimalSecond).toBeDefined()
        expect(placedAnimalSecond.animalInfo.animalId).toBe(animalSecond.id)

        // Verify building occupancy
        const updatedBuilding = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: constructResponse.placedItemId },
            relations: { buildingInfo: true }
        })

        expect(updatedBuilding.buildingInfo.occupancy).toBe(2)
    })

    it("Should fail to buy an animal due to insufficient funds", async () => {
        const userBeforeWorkflow = await dataSource.manager.save(UserEntity, users[2])

        // Step 1: Construct a building
        const building = await dataSource.manager.findOneOrFail(BuildingEntity, {
            where: { id: BuildingId.Pasture, availableInShop: true }
        })

        const constructBuildingRequest: ConstructBuildingRequest = {
            buildingId: building.id,
            userId: userBeforeWorkflow.id,
            position: { x: 5, y: 5 }
        }

        const constructResponse: ConstructBuildingResponse =
            await constructBuildingService.constructBuilding(constructBuildingRequest)

        // Step 2: Attempt to buy an expensive animal
        const expensiveAnimal = await dataSource.manager.findOneOrFail(AnimalEntity, {
            where: { id: AnimalId.Cow, availableInShop: true }
        })

        const buyAnimalRequest: BuyAnimalRequest = {
            animalId: expensiveAnimal.id,
            userId: userBeforeWorkflow.id,
            placedItemBuildingId: constructResponse.placedItemId,
            position: { x: 10, y: 10 }
        }

        const userAfterBuyingConstruction = await dataSource.manager.findOne(UserEntity, {
            where: { id: userBeforeWorkflow.id }
        })

        await expect(buyAnimalService.buyAnimal(buyAnimalRequest)).rejects.toThrow(
            new UserInsufficientGoldException(
                userAfterBuyingConstruction.golds,
                expensiveAnimal.price
            )
        )
    })

    it("Should fail to buy two different animals due to not same building type", async () => {
        const userBeforeWorkflow = await dataSource.manager.save(UserEntity, users[3])

        // Step 1: Construct a building
        const building = await dataSource.manager.findOneOrFail(BuildingEntity, {
            where: { id: BuildingId.Pasture, availableInShop: true }
        })

        const constructBuildingRequest: ConstructBuildingRequest = {
            buildingId: building.id,
            userId: userBeforeWorkflow.id,
            position: { x: 5, y: 5 }
        }

        const constructResponse: ConstructBuildingResponse =
            await constructBuildingService.constructBuilding(constructBuildingRequest)

        // Step 2: Buy the first animal
        const animalFirst = await dataSource.manager.findOneOrFail(AnimalEntity, {
            where: { id: AnimalId.Cow, availableInShop: true }
        })

        const buyAnimalFirstRequest: BuyAnimalRequest = {
            animalId: animalFirst.id,
            userId: userBeforeWorkflow.id,
            placedItemBuildingId: constructResponse.placedItemId,
            position: { x: 10, y: 10 }
        }

        const buyAnimalFirstResponse: BuyAnimalResponse =
            await buyAnimalService.buyAnimal(buyAnimalFirstRequest)

        // Verify first animal
        const placedAnimalFirst = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: buyAnimalFirstResponse.placedItemId, userId: userBeforeWorkflow.id },
            relations: { animalInfo: true }
        })

        expect(placedAnimalFirst).toBeDefined()
        expect(placedAnimalFirst.animalInfo.animalId).toBe(animalFirst.id)

        // Step 3: Buy the second animal
        const animalSecond = await dataSource.manager.findOneOrFail(AnimalEntity, {
            where: { id: AnimalId.Chicken, availableInShop: true }
        })

        const buyAnimalSecondRequest: BuyAnimalRequest = {
            animalId: animalSecond.id,
            userId: userBeforeWorkflow.id,
            placedItemBuildingId: constructResponse.placedItemId,
            position: { x: 15, y: 15 }
        }

        await expect(buyAnimalService.buyAnimal(buyAnimalSecondRequest)).rejects.toThrow(
            new BuildingNotSameAnimalException(animalSecond.id)
        )
    })
    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, users)
    })
})

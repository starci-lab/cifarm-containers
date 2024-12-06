import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import { BuildingEntity, BuildingId, PlacedItemEntity, UserEntity } from "@src/database"
import { GoldBalanceService } from "@src/services"
import { DataSource, DeepPartial } from "typeorm"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"
import { ConstructBuildingModule } from "./construct-building.module"
import { ConstructBuildingService } from "./construct-building.service"
import { UserInsufficientGoldException } from "@src/exceptions"

describe("ConstructBuildingService", () => {
    let dataSource: DataSource
    let service: ConstructBuildingService

    // Test users
    const users: Array<DeepPartial<UserEntity>> = [
        {
            username: "test_user_construct_building_1",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 5000
        },
        {
            username: "test_user_construct_building_2",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 100
        }
    ]

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: [".env.local"],
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
                ConstructBuildingModule
            ],
            providers: [GoldBalanceService]
        }).compile()

        dataSource = module.get(DataSource)
        service = module.get(ConstructBuildingService)
    })

    it("Should construct a building successfully", async () => {
        const userBeforeConstruction = await dataSource.manager.save(UserEntity, users[0])

        // Fetch a building and placed item type
        const building = await dataSource.manager.findOne(BuildingEntity, {
            where: { id: BuildingId.Pasture, availableInShop: true }
        })

        const constructBuildingRequest: ConstructBuildingRequest = {
            buildingId: building.id,
            userId: userBeforeConstruction.id,
            position: { x: 10, y: 20 }
        }

        // Construct building
        const response: ConstructBuildingResponse =
            await service.constructBuilding(constructBuildingRequest)

        // Verify user's gold was deducted
        const userAfterConstruction = await dataSource.manager.findOne(UserEntity, {
            where: { id: userBeforeConstruction.id }
        })

        expect(userAfterConstruction.golds).toBe(users[0].golds - building.price)

        // Verify placed item was created
        const placedItem = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: response.placedItemId, userId: userBeforeConstruction.id },
            relations: { buildingInfo: true }
        })

        expect(placedItem).toBeDefined()
        expect(placedItem.buildingInfo.buildingId).toBe(building.id)
        expect(placedItem.buildingInfo.currentUpgrade).toBe(1)
        expect(placedItem.buildingInfo.occupancy).toBe(0)
        expect(placedItem.x).toBe(constructBuildingRequest.position.x)
        expect(placedItem.y).toBe(constructBuildingRequest.position.y)
    })

    it("Should fail when user has insufficient gold", async () => {
        const userBeforeConstruction = await dataSource.manager.save(UserEntity, users[1])

        const building = await dataSource.manager.findOne(BuildingEntity, {
            where: { id: BuildingId.Pasture }
        })

        const constructBuildingRequest: ConstructBuildingRequest = {
            buildingId: building.id,
            userId: userBeforeConstruction.id,
            position: { x: 10, y: 20 }
        }

        //2 params: current, total cost
        await expect(service.constructBuilding(constructBuildingRequest)).rejects.toThrow(
            new UserInsufficientGoldException(userBeforeConstruction.golds, building.price)
        )
    })

    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, users)
    })
})

import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import {
    BuildingId,
    PlacedItemEntity,
    UserEntity
} from "@src/database"
import { GoldBalanceService } from "@src/services"
import { DataSource, DeepPartial } from "typeorm"
import { UpgradeBuildingRequest, UpgradeBuildingResponse } from "./upgrade-building.dto"
import { UpgradeBuildingModule } from "./upgrade-building.module"
import { UpgradeBuildingService } from "./upgrade-building.service"

describe("UpgradeBuildingService", () => {
    let dataSource: DataSource
    let service: UpgradeBuildingService

    const users: Array<DeepPartial<UserEntity>> = [
        {
            username: "test_user_upgrade_1",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 5000,
        },
    ]

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: [".env.local"],
                    isGlobal: true,
                }),
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().database.postgres.gameplay.test.host,
                    port: envConfig().database.postgres.gameplay.test.port,
                    username: envConfig().database.postgres.gameplay.test.user,
                    password: envConfig().database.postgres.gameplay.test.pass,
                    database: envConfig().database.postgres.gameplay.test.dbName,
                    autoLoadEntities: true,
                    synchronize: true,
                }),
                UpgradeBuildingModule,
            ],
            providers: [GoldBalanceService],
        }).compile()

        dataSource = module.get(DataSource)
        service = module.get(UpgradeBuildingService)
    })

    it("Should upgrade a building successfully", async () => {
        const user = await dataSource.manager.save(UserEntity, users[0])

        const placedItem = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            buildingInfo: {
                currentUpgrade: 1,
                buildingId: BuildingId.Pasture,
                occupancy: 0,
            },
            x: 0,
            y: 0,
        })

        const request: UpgradeBuildingRequest = {
            placedItemId: placedItem.id,
            userId: user.id,
        }

        const response: UpgradeBuildingResponse = await service.upgradeBuilding(request)

        expect(response).toBeDefined()
        expect(response.placedItemId).toBe(placedItem.id)

        const updatedPlacedItem = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: placedItem.id },
        })
        expect(updatedPlacedItem.buildingInfo.currentUpgrade).toBe(2)
    })
    afterAll(async () => {
        await dataSource.manager.delete(UserEntity, users)
    })
})

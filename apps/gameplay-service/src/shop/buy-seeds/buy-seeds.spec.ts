import { Logger } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import { CropEntity, InventoryEntity, PlacedItemEntity, UserEntity } from "@src/database"
import { SeedDataModule, SeedDataService } from "@src/services"
import { createDatabase } from "@src/utils"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { BuySeedsModule } from "./buy-seeds.module"
import { BuySeedsService } from "./buy-seeds.service"
import * as path from "path"

describe("BuySeedsService", () => {
    let service: BuySeedsService
    let dataSource: DataSource
    let logger: Logger
    let seedData: SeedDataService

    beforeEach(async () => {
        const mockDbName = v4()

        console.log(path)
        console.log(path.join(process.cwd(), ".env.local"))
        console.log(process.env.GAMEPLAY_POSTGRES_HOST)

        await createDatabase({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.host,
            port: envConfig().database.postgres.gameplay.port,
            user: envConfig().database.postgres.gameplay.user,
            pass: envConfig().database.postgres.gameplay.pass,
            dbName: mockDbName
        })

        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: path.join(process.cwd(), ".env.local"),
                    isGlobal: true
                }),
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().database.postgres.gameplay.host,
                    port: envConfig().database.postgres.gameplay.port,
                    username: envConfig().database.postgres.gameplay.user,
                    password: envConfig().database.postgres.gameplay.pass,
                    database: mockDbName,
                    autoLoadEntities: true,
                    synchronize: true
                }),
                TypeOrmModule.forFeature([UserEntity, PlacedItemEntity]),
                SeedDataModule,
                BuySeedsModule
            ],
            providers: []
        }).compile()

        logger = new Logger("BuySeedsService:Test")
        seedData = module.get(SeedDataService)
        dataSource = module.get(DataSource)
        service = module.get(BuySeedsService)

        console.log(envConfig().database.postgres.gameplay.host)

        logger.debug("Seeding static data")
        await seedData.seedStaticData(dataSource)
        logger.debug("Seeded static data")
    })

    it("Should happy case work", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Create user account
            const user = await queryRunner.manager.save(UserEntity, {
                username: "test_user",
                chainKey: SupportedChainKey.Solana,
                accountAddress: "0x123456789abcdef",
                network: Network.Mainnet,
                tokens: 50.5,
                experiences: 10,
                energy: 5,
                level: 2,
                golds: 1000
            })

            console.log("User created:", user)

            // Fetch user to verify persistence
            const savedUser = await queryRunner.manager.findOne(UserEntity, {
                where: { id: user.id }
            })

            if (!savedUser) throw new Error("User not found in database")
            console.log("Verified saved user:", savedUser)

            // Get carrot
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: "carrot" }
            })

            if (!crop) throw new Error("Crop not found")
            console.log("Crop:", crop)

            const buySeedRequest = {
                id: crop.id,
                userId: savedUser.id,
                quantity: 1
            }

            // Buy seeds
            await service.buySeeds(buySeedRequest)

            // Check inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { userId: savedUser.id, inventoryType: { cropId: crop.id } },
                relations: {
                    inventoryType: true
                }
            })

            expect(inventory.quantity).toBe(buySeedRequest.quantity)
        } catch (error) {
            logger.error("ERROR:", error)
            throw error
        } finally {
            await queryRunner.release()
        }
    })

    afterEach(async () => {
        // Ensure the database is deleted after each test
        try {
            logger.debug("Deleting test database" + dataSource.options.database)
            // await dataSource.dropDatabase()
            logger.debug("Deleted test database" + dataSource.options.database)
        } catch (error) {
            logger.debug("Error deleting test database", error)
        }
    })
})

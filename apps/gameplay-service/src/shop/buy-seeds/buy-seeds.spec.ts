import { Logger } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import { CropEntity, InventoryEntity, UserEntity } from "@src/database"
import { SeedDataModule } from "@src/services"
import * as path from "path"
import { DataSource, DeepPartial } from "typeorm"
import { BuySeedsModule } from "./buy-seeds.module"
import { BuySeedsService } from "./buy-seeds.service"

describe("BuySeedsService", () => {
    let dataSource: DataSource
    const logger: Logger = new Logger("BuySeedsService:Test")
    let service: BuySeedsService
    const userEntity: DeepPartial<UserEntity> = {
        username: "test_user",
        chainKey: SupportedChainKey.Solana,
        accountAddress: "0x123456789abcdef",
        network: Network.Mainnet,
        tokens: 50.5,
        experiences: 10,
        energy: 5,
        level: 2,
        golds: 1000
    }

    beforeEach(async () => {
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
                SeedDataModule,
                BuySeedsModule
            ],
            providers: []
        }).compile()
        dataSource = module.get(DataSource)
        service = module.get(BuySeedsService)
    })

    it("Should happy case work", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const userBeforeBuydingSeed = await queryRunner.manager.save(UserEntity, userEntity)

            // Get carrot
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: "carrot" }
            })

            if (!crop) throw new Error("Crop not found")
            console.log("Crop:", crop)

            const buySeedRequest = {
                cropId: crop.id,
                userId: userBeforeBuydingSeed.id,
                quantity: 1
            }

            // Buy seeds
            await service.buySeeds(buySeedRequest)

            // Check user golds
            const userAfterBuyingSeed = await queryRunner.manager.findOne(UserEntity, {
                where: { id: userBeforeBuydingSeed.id }
            })

            expect(userAfterBuyingSeed.golds).toBe(
                userEntity.golds - crop.price * buySeedRequest.quantity
            )

            // Check inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { userId: userBeforeBuydingSeed.id, inventoryType: { cropId: crop.id } },
                relations: {
                    inventoryType: true
                }
            })

            expect(inventory.quantity).toBe(buySeedRequest.quantity)
        } finally {
            await queryRunner.release()
        }
    })

    it("Should basic scenario work should buy 2 time, stack inventory", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const userBeforeBuydingSeed = await queryRunner.manager.save(UserEntity, userEntity)

            // Get carrot
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: "carrot" }
            })

            if (!crop) throw new Error("Crop not found")
            console.log("Crop:", crop)

            // buySeedFirstRequest
            const buySeedFirstRequest = {
                cropId: crop.id,
                userId: userBeforeBuydingSeed.id,
                quantity: 2
            }
            await service.buySeeds(buySeedFirstRequest)

            // buySeedSecondRequest
            const buySeedSecondRequest = {
                cropId: crop.id,
                userId: userBeforeBuydingSeed.id,
                quantity: 2
            }
            await service.buySeeds(buySeedSecondRequest)

            // Check user golds
            const userAfterBuyingSeed = await queryRunner.manager.findOne(UserEntity, {
                where: { id: userBeforeBuydingSeed.id }
            })

            expect(userAfterBuyingSeed.golds).toBe(
                userEntity.golds -
                    (crop.price * buySeedFirstRequest.quantity +
                        crop.price * buySeedSecondRequest.quantity)
            )

            // Check inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { userId: userBeforeBuydingSeed.id, inventoryType: { cropId: crop.id } },
                relations: {
                    inventoryType: true
                }
            })

            expect(inventory.quantity).toBe(
                buySeedFirstRequest.quantity + buySeedSecondRequest.quantity
            )
        } finally {
            await queryRunner.release()
        }
    })

    afterEach(async () => {
        // Ensure the database is deleted after each test
        try {
            logger.debug("Deleting test database" + dataSource.options.database)

            logger.debug("Deleted test database" + dataSource.options.database)
        } catch (error) {
            logger.debug("Error deleting test database", error)
        }
    })
})

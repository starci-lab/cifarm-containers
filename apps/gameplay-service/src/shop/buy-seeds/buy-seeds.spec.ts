import { DataSource } from "typeorm"
import { BuySeedsService } from "./buy-seeds.service"
import { Test } from "@nestjs/testing"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { createDatabase } from "@src/utils"
import { v4 } from "uuid"
import { PlacedItemEntity, UserEntity } from "@src/database"
import { Logger } from "@nestjs/common"
import { SeedDataService } from "@src/services"

describe("BuySeedsService", () => {
    let service: BuySeedsService
    let dataSource: DataSource
    let logger: Logger
    let seedData: SeedDataService

    beforeEach(async () => {
        const mockDbName = v4()

        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: [".env.local"],
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
                TypeOrmModule.forFeature([UserEntity, PlacedItemEntity])
            ],
            providers: [SeedDataService]
        }).compile()

        await createDatabase({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.host,
            port: envConfig().database.postgres.gameplay.port,
            user: envConfig().database.postgres.gameplay.user,
            pass: envConfig().database.postgres.gameplay.pass,
            dbName: mockDbName
        })

        console.log("Loaded Config:", envConfig())

        logger = new Logger("BuySeedsService:Test")
        service = module.get(BuySeedsService)
        dataSource = module.get(DataSource)
        seedData = module.get(SeedDataService)

        await seedData.seedStaticData(dataSource)
    })

    it("Should happy case work", async () => {
        //create account
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            //create account
            await queryRunner.manager.save(UserEntity, {
                accountAddress: "0x123"
            })
            console.log(service)
        } catch (error) {
            logger.error(error)
            await queryRunner.rollbackTransaction()
        } finally {
            await queryRunner.release()
        }
    })
})

import { DataSource } from "typeorm"
import { HarvestCropService } from "./harvest-crop.service"
import { Test } from "@nestjs/testing"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { createDatabase } from "@src/utils"
import { v4 } from "uuid"
import { PlacedItemEntity, UserEntity } from "@src/database"
import { SeedDataService } from "@apps/seed-data"
import { Logger } from "@nestjs/common"

describe("HarvestCropService", () => {
    let service: HarvestCropService
    let dataSource: DataSource
    let logger: Logger
    
    beforeEach(async () => {
        const mockDbName = v4()
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
                    envFilePath: [".env.local"],
                    isGlobal: true,
                }),
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().database.postgres.gameplay.host,
                    port: envConfig().database.postgres.gameplay.port,
                    username: envConfig().database.postgres.gameplay.user,
                    password: envConfig().database.postgres.gameplay.pass,
                    database: mockDbName,
                    autoLoadEntities: true,
                    synchronize: true,
                }),
                TypeOrmModule.forFeature([
                    UserEntity,
                    PlacedItemEntity,
                ]),
            ],
            providers: [SeedDataService],
        }).compile()

        logger = new Logger("HarvestCropService:Test")
        service = module.get(HarvestCropService)
        dataSource = module.get(DataSource)
    })

    it("Should happy case work", async () => {
        //create account
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            //create account
            await queryRunner.manager.save(UserEntity, {
                accountAddress: "0x123",
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
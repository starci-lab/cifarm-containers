import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import {
    AnimalEntity,
    AnimalInfoEntity,
    BuildingEntity,
    BuildingInfoEntity,
    CropEntity,
    DailyRewardEntity,
    DailyRewardPossibilityEntity,
    DeliveringProductEntity,
    InventoryEntity,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemTypeEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    SpinEntity,
    SupplyEntity,
    SystemEntity,
    TileEntity,
    ToolEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { SeedDataModule } from "@src/services"
import { AppService } from "./app.service"

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            name: "main",
            type: "postgres",
            host: envConfig().database.postgres.gameplay.main.host,
            port: envConfig().database.postgres.gameplay.main.port,
            username: envConfig().database.postgres.gameplay.main.user,
            password: envConfig().database.postgres.gameplay.main.pass,
            database: envConfig().database.postgres.gameplay.main.dbName,
            autoLoadEntities: true,
            synchronize: true
        }),
        TypeOrmModule.forRoot({
            name: "test",
            type: "postgres",
            host: envConfig().database.postgres.gameplay.test.host,
            port: envConfig().database.postgres.gameplay.test.port,
            username: envConfig().database.postgres.gameplay.test.user,
            password: envConfig().database.postgres.gameplay.test.pass,
            database: envConfig().database.postgres.gameplay.test.dbName,
            autoLoadEntities: true,
            synchronize: true
        }),
        TypeOrmModule.forFeature(
            [
                ToolEntity,
                AnimalEntity,
                BuildingEntity,
                CropEntity,
                ProductEntity,
                UpgradeEntity,
                TileEntity,
                SupplyEntity,
                DailyRewardEntity,
                DailyRewardPossibilityEntity,
                SpinEntity,
                SystemEntity,
                InventoryTypeEntity,
                InventoryEntity,
                UserEntity,
                PlacedItemEntity,
                SeedGrowthInfoEntity,
                AnimalInfoEntity,
                BuildingInfoEntity,
                PlacedItemTypeEntity,
                DeliveringProductEntity
            ],
            "main"
        ),
        TypeOrmModule.forFeature(
            [
                ToolEntity,
                AnimalEntity,
                BuildingEntity,
                CropEntity,
                ProductEntity,
                UpgradeEntity,
                TileEntity,
                SupplyEntity,
                DailyRewardEntity,
                DailyRewardPossibilityEntity,
                SpinEntity,
                SystemEntity,
                InventoryTypeEntity,
                InventoryEntity,
                UserEntity,
                PlacedItemEntity,
                SeedGrowthInfoEntity,
                AnimalInfoEntity,
                BuildingInfoEntity,
                PlacedItemTypeEntity,
                DeliveringProductEntity
            ],
            "test"
        ),
        SeedDataModule
    ],
    exports: [AppService],
    providers: [AppService]
})
export class AppModule {}

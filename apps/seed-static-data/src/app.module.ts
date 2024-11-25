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
    DailyRewardPossibility,
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
            type: "postgres",
            host: envConfig().database.postgres.gameplay.host,
            port: envConfig().database.postgres.gameplay.port,
            username: envConfig().database.postgres.gameplay.user,
            password: envConfig().database.postgres.gameplay.pass,
            database: envConfig().database.postgres.gameplay.dbName,
            autoLoadEntities: true,
            synchronize: true
        }),
        TypeOrmModule.forFeature([
            ToolEntity,
            AnimalEntity,
            BuildingEntity,
            CropEntity,
            ProductEntity,
            UpgradeEntity,
            TileEntity,
            SupplyEntity,
            DailyRewardEntity,
            DailyRewardPossibility,
            SpinEntity,
            SystemEntity,
            InventoryTypeEntity,
            InventoryEntity,
            UserEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity,
            PlacedItemTypeEntity
        ]),
        SeedDataModule
    ],
    exports: [AppService],
    providers: [AppService]
})
export class AppModule {}

import { DynamicModule } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import {
    InventoryEntity,
    PlacedItemEntity,
    UserEntity,
    ProductEntity,
    AnimalEntity,
    CropEntity,
    ToolEntity,
    BuildingEntity,
    UpgradeEntity,
    TileEntity,
    SupplyEntity,
    DailyRewardEntity,
    SpinSlotEntity,
    AnimalInfoEntity,
    BuildingInfoEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    InventoryTypeEntity,
    PlacedItemTypeEntity,
    DeliveringProductEntity,
    SpinPrizeEntity,
    HealthcheckEntity
} from "@src/database"

export const typeOrmForRoot = (): DynamicModule => 
    TypeOrmModule.forRoot({
        type: "postgres",
        host: envConfig().database.postgres.gameplay.main.host,
        port: envConfig().database.postgres.gameplay.main.port,
        username: envConfig().database.postgres.gameplay.main.user,
        password: envConfig().database.postgres.gameplay.main.pass,
        database: envConfig().database.postgres.gameplay.main.dbName,
        autoLoadEntities: true,
        synchronize: true,
        poolSize: 10000,
    })

export const typeOrmForFeature = (): DynamicModule =>
    TypeOrmModule.forFeature([
        InventoryEntity,
        PlacedItemEntity,
        UserEntity,
        ProductEntity,
        AnimalEntity,
        CropEntity,
        ToolEntity,
        BuildingEntity,
        UpgradeEntity,
        TileEntity,
        SupplyEntity,
        DailyRewardEntity,
        SpinSlotEntity,
        AnimalInfoEntity,
        BuildingInfoEntity,
        SeedGrowthInfoEntity,
        SystemEntity,
        InventoryTypeEntity,
        PlacedItemTypeEntity,
        DeliveringProductEntity,
        SpinPrizeEntity,
        SpinSlotEntity,
        AnimalInfoEntity,
        BuildingInfoEntity,
        HealthcheckEntity
    ])

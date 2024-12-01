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
} from "@src/database"
import { FollowRecordEntity } from "@src/database/gameplay-postgresql/follow-record.entity"

export enum TypeOrmDbType {
    Main,
    Test
}

export interface TypeORMConfig {
    host: string
    port: number
    username: string
    password: string
    database: string
    name?: string
}

export const TEST_NAME = "test"

export const typeOrmForRoot = (type: TypeOrmDbType = TypeOrmDbType.Main): DynamicModule => {
    const map: Record<TypeOrmDbType, TypeORMConfig> = {
        [TypeOrmDbType.Main]: {
            host: envConfig().database.postgres.gameplay.main.host,
            port: envConfig().database.postgres.gameplay.main.port,
            username: envConfig().database.postgres.gameplay.main.user,
            password: envConfig().database.postgres.gameplay.main.pass,
            database: envConfig().database.postgres.gameplay.main.dbName,
        },
        [TypeOrmDbType.Test]: {
            host: envConfig().database.postgres.gameplay.test.host,
            port: envConfig().database.postgres.gameplay.test.port,
            username: envConfig().database.postgres.gameplay.test.user,
            password: envConfig().database.postgres.gameplay.test.pass,
            database: envConfig().database.postgres.gameplay.test.dbName,
            name: TEST_NAME
        }
    }

    return TypeOrmModule.forRoot({
        type: "postgres",
        ...map[type],
        autoLoadEntities: true,
        synchronize: true,
        poolSize: 10000
    })
}

export const typeOrmForFeature = (type: TypeOrmDbType = TypeOrmDbType.Main): DynamicModule => {
    const map: Record<TypeOrmDbType, string> = {
        [TypeOrmDbType.Main]: undefined,
        [TypeOrmDbType.Test]: TEST_NAME
    }

    return TypeOrmModule.forFeature(
        [
            InventoryEntity,
            PlacedItemEntity,
            UserEntity,
            ProductEntity,
            AnimalEntity,
            CropEntity,
            ToolEntity,
            BuildingEntity,
            FollowRecordEntity,
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
        ],
        map[type]
    )
}

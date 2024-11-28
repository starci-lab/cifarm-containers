import { ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { CacheModule, CacheStore } from "@nestjs/cache-manager"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { redisStore } from "cache-manager-redis-yet"
import { ToolsModule } from "@apps/static-subgraph/src/tools"
// import * as apolloPlugins from "@apollo/server/plugin/disabled"
import { AnimalsModule } from "@apps/static-subgraph/src/animals/animals.module"
import { CropsModule } from "@apps/static-subgraph/src/crops/crops.module"
import { BuildingsModule } from "@apps/static-subgraph/src/buildings/buildings.module"
import { DailyRewardsModule } from "@apps/static-subgraph/src/daily-rewards/daily-rewards.module"
import { SpinsModule } from "@apps/static-subgraph/src/spins/spins.module"
import { SuppliesModule } from "@apps/static-subgraph/src/supplies/supplies.module"
import { TilesModule } from "@apps/static-subgraph/src/tiles/tiles.module"
import { UsersModule } from "@apps/static-subgraph/src/users"
import { TileEntity, InventoryTypeEntity, ToolEntity, InventoryEntity, UserEntity, SupplyEntity, SpinEntity, DailyRewardPossibility, DailyRewardEntity, CropEntity, ProductEntity, AnimalEntity, BuildingInfoEntity, AnimalInfoEntity, BuildingEntity, PlacedItemEntity, PlacedItemTypeEntity, SeedGrowthInfoEntity, UpgradeEntity } from "@src/database"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AnimalEntity, AnimalInfoEntity,
            BuildingEntity, BuildingInfoEntity,
            CropEntity,
            DailyRewardEntity, DailyRewardPossibility,
            InventoryEntity, InventoryTypeEntity,
            PlacedItemEntity, PlacedItemTypeEntity, ProductEntity,
            SeedGrowthInfoEntity, SpinEntity,
            SupplyEntity,
            TileEntity, ToolEntity,
            UpgradeEntity, UserEntity
        ]),
        ConfigModule.forRoot({
            load: [envConfig],
            envFilePath: [".env.local"],
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: envConfig().database.postgres.gameplay.main.host,
            port: envConfig().database.postgres.gameplay.main.port,
            username: envConfig().database.postgres.gameplay.main.user,
            password: envConfig().database.postgres.gameplay.main.pass,
            database: envConfig().database.postgres.gameplay.main.dbName,
            autoLoadEntities: true,
            synchronize: true
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => {
                const store = await redisStore({
                    socket: {
                        host: envConfig().database.redis.cache.host,
                        port: envConfig().database.redis.cache.port
                    }
                })

                const ttl = envConfig().redis.ttl
                return {
                    store: store as unknown as CacheStore,
                    ttl: ttl
                }
            }
        }),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            typePaths: ["./**/*.gql"],
            playground: false,
            // plugins: [apolloPlugins.ApolloServerPluginInlineTraceDisabled()],
            buildSchemaOptions: {
                orphanedTypes: []
            }

        }),
        AnimalsModule,
        BuildingsModule,
        CropsModule,
        DailyRewardsModule,
        SpinsModule,
        SuppliesModule,
        TilesModule,
        ToolsModule,
        UsersModule
    ],
})
export class AppModule { }

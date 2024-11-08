import { ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { GraphQLModule } from "@nestjs/graphql"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { AnimalsModule } from "./animals"
import { BuildingsModule } from "./buildings"
import { CropsModule } from "./crops"
import { ToolsModule } from "./tools"
import { DailyRewardsModule } from "./daily-rewards"
import { SpinsModule } from "./spins"
import { SuppliesModule } from "./supplies"
import { TilesModule } from "./tiles"

@Module({
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
            database: envConfig().database.postgres.gameplay.dbName,    
            autoLoadEntities: true,
            synchronize: true,
        }),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
            driver: ApolloFederationDriver,
            typePaths: ["./**/*.gql"],
            playground: false,
            //plugins: [ApolloServerPluginInlineTraceDisabled],
            buildSchemaOptions: {
                orphanedTypes: [],
            },
        }),  
        AnimalsModule,
        CropsModule,
        ToolsModule,
        BuildingsModule,
        DailyRewardsModule,
        SpinsModule,
        SuppliesModule,
        TilesModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}

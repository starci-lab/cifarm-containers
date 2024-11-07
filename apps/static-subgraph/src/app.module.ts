import { Module } from "@nestjs/common"
import { AnimalsModule } from "./animals"
import { ConfigModule } from "@nestjs/config"
import { envConfig } from "@src/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { GraphQLModule } from "@nestjs/graphql"
import { ApolloFederationDriver, ApolloFederationDriverConfig } from "@nestjs/apollo"

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
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}

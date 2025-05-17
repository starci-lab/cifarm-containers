import { Module, ValidationPipe } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { GraphQLSubgraphModule } from "@src/graphql"
import { CryptoModule } from "@src/crypto"
import { JwtModule } from "@src/jwt"
import { MongooseModule } from "@src/databases"
import { APP_FILTER, APP_PIPE } from "@nestjs/core"
import { KafkaModule } from "@src/brokers"
import { BlockchainModule } from "@src/blockchain"
import { DateModule } from "@src/date"
import { HoneycombModule } from "@src/honeycomb"
import { BlockchainExceptionFilter, GameplayExceptionFilter } from "./filters"
import { CacheModule } from "@src/cache"
import { GameplayModule } from "@src/gameplay"
import { MutationsModule } from "./mutations"
import { QueriesModule } from "./queries"
import { IdModule } from "@src/id"
import { ThrottlerModule } from "@src/throttler"
import { BlockchainDatabaseModule } from "@src/blockchain-database"
import { S3Module } from "@src/s3"
@Module({
    imports: [
        IdModule.register({
            name: "Gameplay Subgraph",
            isGlobal: true
        }),
        //core modules
        EnvModule.forRoot(),
        GraphQLSubgraphModule.forRoot(),
        CryptoModule.register({
            isGlobal: true
        }),
        MongooseModule.forRoot(),
        CacheModule.register({
            isGlobal: true
        }),
        JwtModule.register({
            isGlobal: true
        }),
        KafkaModule.register({
            isGlobal: true
        }),
        BlockchainModule.register({
            isGlobal: true
        }),
        GameplayModule.register({
            isGlobal: true,
        }),
        DateModule.register({
            isGlobal: true
        }),
        HoneycombModule.register({
            isGlobal: true
        }),
        ThrottlerModule.forRoot(),
        BlockchainDatabaseModule.register({
            isGlobal: true
        }),
        S3Module.register({
            isGlobal: true
        }),
        //functional modules
        QueriesModule,
        MutationsModule
    ],
    providers: [
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                whitelist: true
            })
        },
        {
            provide: APP_FILTER,
            useClass: BlockchainExceptionFilter
        },
        {
            provide: APP_FILTER,
            useClass: GameplayExceptionFilter
        },
    ]
}) 
export class AppModule {}
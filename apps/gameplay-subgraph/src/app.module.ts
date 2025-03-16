import { Module, ValidationPipe } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { GraphQLSubgraphModule } from "@src/graphql"
import { CryptoModule } from "@src/crypto"
import { CacheModule } from "@src/cache"
import { JwtModule } from "@src/jwt"
import { MongooseModule } from "@src/databases"
import { QueriesModule } from "./queries"
import { APP_PIPE } from "@nestjs/core"
import { MutationsModule } from "./mutations"
@Module({
    imports: [
        //core modules
        EnvModule.forRoot(),
        CryptoModule.register({
            isGlobal: true
        }),
        CacheModule.register({
            isGlobal: true
        }),
        JwtModule.register({
            isGlobal: true
        }),
        GraphQLSubgraphModule.forRoot(),
        MongooseModule.forRoot(),
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
        }
    ]
}) 
export class AppModule {}
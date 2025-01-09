import { Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"
import { KafkaModule } from "@src/brokers"
import { CacheModule } from "@src/cache"
import { PostgreSQLModule } from "@src/databases"
import { EnvModule } from "@src/env"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { UpgradeModule } from "./upgrade"

@Module({
    imports: [
        PostgreSQLModule.forRoot({
            isGlobal: true
        }),
        CacheModule.register({
            isGlobal: true
        }),
        EnvModule,
        KafkaModule,
        // AuthModule,
        // ClaimModule,
        // CommunityModule,
        // DeliveryModule,
        // DevModule,
        // FarmingModule,
        // PlacementModule,
        // ProfileModule,
        // ShopModule,
        // UpgradeModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GrpcServerExceptionFilter
        }
    ]
})
export class AppModule {}
 
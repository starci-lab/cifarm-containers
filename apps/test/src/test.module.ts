import { Module } from "@nestjs/common"
import { TestController } from "./test.controller"
import { TestService } from "./test.service"
import { PostgreSQLModule } from "@src/databases"
import { SubModule } from "./sub/sub.module"
import { EnvModule } from "@src/env"
import { CacheModule } from "@src/cache"
import { BullModule, BullQueueName } from "@src/bull"
import { KafkaModule } from "@src/brokers"
import { LeaderElectionModule } from "@src/leader-election"

@Module({
    imports: [
        SubModule,
        EnvModule.forRoot(),
        PostgreSQLModule.forRoot(),
        CacheModule.forRoot({
            isGlobal: true
        }),
        BullModule.forRoot(),
        BullModule.registerQueues({
            isGlobal: true,
            queueNames: [
                BullQueueName.Crop,
                BullQueueName.Animal,
                BullQueueName.Delivery,
                BullQueueName.Energy
            ]
        }),
        KafkaModule.register({
            isGlobal: true
        }),
        LeaderElectionModule.forRoot()
    ],
    controllers: [TestController],
    providers: [TestService]
})
export class TestModule {}

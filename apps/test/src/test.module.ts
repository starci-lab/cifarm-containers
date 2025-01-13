import { Module } from "@nestjs/common"
import { AxiosModule, AxiosType } from "@src/axios"
import { EnvModule } from "@src/env"
import { TestService } from "./test.service"

@Module({
    imports: [
        // SubModule,
        EnvModule.forRoot(),
        // PostgreSQLModule.forRoot(),
        // CacheModule.register({
        //     isGlobal: true
        // }),
        // BullModule.forRoot(),
        // BullModule.registerQueues({
        //     isGlobal: true,
        //     queueName: [
        //         BullQueueName.Crop,
        //         BullQueueName.Animal,
        //         BullQueueName.Delivery,
        //         BullQueueName.Energy
        //     ]
        // }),
        // KafkaModule.register({
        //     isGlobal: true
        // }),
        // LeaderElectionModule.forRoot()
        AxiosModule.register({
            type: AxiosType.NoAuth
        })
    ],
    providers: [TestService]
})
export class TestModule {}

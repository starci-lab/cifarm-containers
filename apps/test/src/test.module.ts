import { Module } from "@nestjs/common"
import { ApiVersion, AxiosModule, AxiosType, DEFAULT_BASE_URL } from "@src/axios"
import { AxiosOptionsModule } from "@src/axios/options"
import { EnvModule } from "@src/env"
import { TestController } from "./test.controller"
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
        AxiosOptionsModule.register({
            injectionToken: "TEST",
            options: {
                type: AxiosType.AxiosWithNoAuth
            }
        }),
    ],
    controllers: [TestController],
    providers: [TestService]
})
export class TestModule {}

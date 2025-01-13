import { Module } from "@nestjs/common"
import { AxiosType } from "@src/axios"
import { AxiosOptionsModule } from "@src/axios/options"
import { EnvModule } from "@src/env"
import { TestService } from "./test.service"
import { getAxiosToken } from "@src/axios/axios.utils"

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
            injectionToken: getAxiosToken({
                type: AxiosType.AxiosWithNoAuth
            }),
            options: {
                type: AxiosType.AxiosWithNoAuth
            }
        }),
        AxiosOptionsModule.register({
            injectionToken: getAxiosToken({
                type: AxiosType.AxiosWithAuth
            }),
            options: {
                type: AxiosType.AxiosWithAuth
            }
        }),
    ],
    providers: [TestService]
})
export class TestModule {}

import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { TestingModule } from "@src/testing/testing.module"
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
        TestingModule.register()
    ],
    providers: [TestService]
})
export class TestModule {}

import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { CropsWorker } from "./delivery.service"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { bullConfig, BullQueueName } from "@src/config"

@Module({
    imports: [
        BullModule.registerQueue({
            name: bullConfig[BullQueueName.Delivery].name
        }),
        typeOrmForFeature(),
    ],
    providers: [CropsWorker]
})
export class CropsModule {}

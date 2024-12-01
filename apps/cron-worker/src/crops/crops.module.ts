import { cropsTimeQueueConstants } from "@apps/cron-scheduler"
import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { CropsWorker } from "./crops.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [
        BullModule.registerQueue({
            name: cropsTimeQueueConstants.name
        }),
        typeOrmForFeature(),
    ],
    providers: [CropsWorker]
})
export class CropsModule {}

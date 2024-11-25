import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { cropsTimeQueueConstants } from "../app.constant"

@Module({
    imports: [
        BullModule.registerQueue({
            name: cropsTimeQueueConstants.NAME,
        })
    ],
})
export class CropModule {}

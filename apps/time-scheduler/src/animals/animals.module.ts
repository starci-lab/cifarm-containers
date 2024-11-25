import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { animalsTimeQueueConstants } from "../app.constant"

@Module({
    imports: [
        BullModule.registerQueue({
            name: animalsTimeQueueConstants.NAME,
        })
    ],
})
export class AnimalModule {}

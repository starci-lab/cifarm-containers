import { Module } from "@nestjs/common";
import { SubService } from "./sub.service";
import { BullModule, BullQueueName } from "@src/bull";

@Module({
    imports: [
        BullModule.registerQueue({
            queueName: BullQueueName.Crop
        })
    ],
    providers: [SubService],
})
export class SubModule {}
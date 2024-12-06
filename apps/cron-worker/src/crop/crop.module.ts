import { Module } from "@nestjs/common"
import { CropWorker } from "./crop.worker"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"
import { BullQueueName } from "@src/config"

@Module({
    imports: [
        bullRegisterQueue(BullQueueName.Crop),
        typeOrmForFeature(),
    ],
    providers: [CropWorker]
})
export class CropModule {}

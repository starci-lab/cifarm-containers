import { Module } from "@nestjs/common"
import { CropService } from "./crop.service"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"
import { BullQueueName } from "@src/config"

@Module({
    imports: [
        bullRegisterQueue(BullQueueName.Crop),
        typeOrmForFeature(),
    ],
    providers: [CropService]
})
export class CropModule {}

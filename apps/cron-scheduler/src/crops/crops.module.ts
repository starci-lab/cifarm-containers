import { Module } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { cropsTimeQueueConstants } from "../app.constant"
import { CropsService } from "./crops.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [
        BullModule.registerQueue({
            name: cropsTimeQueueConstants.name
        }),
        typeOrmForFeature(),
    ],
    providers: [CropsService]
})
export class CropsModule {}

import { BullModule } from "@nestjs/bullmq"
import { Module } from "@nestjs/common"
import { animalsTimeQueueConstants } from "../app.constant"
import { AnimalsService } from "./animals.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [
        BullModule.registerQueue({
            name: animalsTimeQueueConstants.name
        }),
        typeOrmForFeature(),
    ],
    providers: [AnimalsService]
})
export class AnimalsModule {}

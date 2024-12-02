import { Module } from "@nestjs/common"
import { AnimalWorker } from "./animal.worker"
import { BullQueueName } from "@src/config"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [
        typeOrmForFeature(),
        bullRegisterQueue(BullQueueName.Animal),
    ],
    providers: [AnimalWorker]
})
export class AnimalModule {}

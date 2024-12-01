import { Module } from "@nestjs/common"
import { AnimalService } from "./animal.service"
import { BullQueueName } from "@src/config"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [
        typeOrmForFeature(),
        bullRegisterQueue(BullQueueName.Animal),
    ],
    providers: [AnimalService]
})
export class AnimalsModule {}

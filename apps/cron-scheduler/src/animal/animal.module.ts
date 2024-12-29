import { Module } from "@nestjs/common"
import { AnimalService } from "./animal.service"
import { bullRegisterQueue, typeOrmForFeature } from "@src/dynamic-modules"
import { BullQueueName } from "@src/grpc"

@Module({
    imports: [
        bullRegisterQueue(BullQueueName.Animal),
        typeOrmForFeature(),
    ],
    providers: [AnimalService]
})
export class AnimalModule {}

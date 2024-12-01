import { Global, Module } from "@nestjs/common"
import { BuyAnimalController } from "./buy-animal.controller"
import { BuyAnimalService } from "./buy-animal.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
    ],
    controllers: [BuyAnimalController],
    providers: [BuyAnimalService],
    exports: [BuyAnimalService]
})
export class BuyAnimalModule {}

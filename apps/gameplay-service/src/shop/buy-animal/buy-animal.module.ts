import { Global, Module } from "@nestjs/common"
import { GameplayPostgreSQLModule } from "@src/databases"
import { GameplayModule } from "@src/gameplay"
import { BuyAnimalController } from "./buy-animal.controller"
import { BuyAnimalService } from "./buy-animal.service"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
        GameplayModule
    ],
    controllers: [BuyAnimalController],
    providers: [BuyAnimalService],
    exports: [BuyAnimalService]
})
export class BuyAnimalModule {}

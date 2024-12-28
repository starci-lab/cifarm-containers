import { Global, Module } from "@nestjs/common"
import { BuyAnimalController } from "./buy-animal.controller"
import { BuyAnimalService } from "./buy-animal.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
    ],
    controllers: [BuyAnimalController],
    providers: [BuyAnimalService],
    exports: [BuyAnimalService]
})
export class BuyAnimalModule {}

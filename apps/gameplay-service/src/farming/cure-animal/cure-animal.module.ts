import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { CureAnimalController } from "./cure-animal.controller"
import { CureAnimalService } from "./cure-animal.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature(),
        GameplayModule
    ],
    controllers: [CureAnimalController],
    providers: [CureAnimalService],
    exports: [CureAnimalService],
})
export class CureAnimalModule {}

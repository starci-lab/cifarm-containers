import { Global, Module } from "@nestjs/common"
import { UpdateTutorialController } from "./update-tutorial.controller"
import { UpdateTutorialService } from "./update-tutorial.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forFeature()
    ],
    providers: [UpdateTutorialService],
    exports: [UpdateTutorialService],
    controllers: [UpdateTutorialController]
})
export class UpdateTutorialModule {}

import { Global, Module } from "@nestjs/common"
import { UpdateTutorialController } from "./update-tutorial.controller"
import { UpdateTutorialService } from "./update-tutorial.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
    ],
    providers: [UpdateTutorialService],
    exports: [UpdateTutorialService],
    controllers: [UpdateTutorialController]
})
export class UpdateTutorialModule {}

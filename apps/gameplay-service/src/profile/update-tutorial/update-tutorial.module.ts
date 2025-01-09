import { Module } from "@nestjs/common"
import { UpdateTutorialController } from "./update-tutorial.controller"
import { UpdateTutorialService } from "./update-tutorial.service"

@Module({
    imports: [],
    providers: [UpdateTutorialService],
    exports: [UpdateTutorialService],
    controllers: [UpdateTutorialController]
})
export class UpdateTutorialModule {}

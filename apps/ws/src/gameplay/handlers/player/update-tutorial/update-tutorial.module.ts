import { Module } from "@nestjs/common"
import { UpdateTutorialService } from "./update-tutorial.service"
import { UpdateTutorialGateway } from "./update-tutorial.gateway"

@Module({
    providers: [UpdateTutorialService, UpdateTutorialGateway]
})
export class UpdateTutorialModule {}

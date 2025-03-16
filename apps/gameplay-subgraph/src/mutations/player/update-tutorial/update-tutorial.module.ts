import { Module } from "@nestjs/common"
import { UpdateTutorialResolver } from "./update-tutorial.resolver"
import { UpdateTutorialService } from "./update-tutorial.service"

@Module({
    providers: [UpdateTutorialService, UpdateTutorialResolver],
})
export class UpdateTutorialModule {}

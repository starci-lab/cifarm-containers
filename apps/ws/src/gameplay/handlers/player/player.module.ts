import { Module } from "@nestjs/common"
import { UpdateSettingsModule } from "./update-settings"
import { UpdateTutorialModule } from "./update-tutorial"

@Module({
    imports: [ UpdateSettingsModule, UpdateTutorialModule ]
})
export class PlayerModule {}

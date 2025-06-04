import { Module } from "@nestjs/common"
import { UpdateSettingsModule } from "./update-settings"
import { UpdateProfileModule } from "./update-profile"
import { UpdateTutorialModule } from "./update-tutorial"

@Module({
    imports: [ UpdateSettingsModule, UpdateProfileModule, UpdateTutorialModule ]
})
export class PlayerModule {}

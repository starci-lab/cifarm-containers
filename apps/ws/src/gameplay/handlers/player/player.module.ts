import { Module } from "@nestjs/common"
import { UpdateSettingsModule } from "./update-settings"

@Module({
    imports: [ UpdateSettingsModule ]
})
export class PlayerModule {}

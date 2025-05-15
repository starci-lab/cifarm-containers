import { Module } from "@nestjs/common"
import { UpdateSettingsModule } from "./update-settings"
import { UpdateProfileModule } from "./update-profile"

@Module({
    imports: [ UpdateSettingsModule, UpdateProfileModule ]
})
export class PlayerModule {}

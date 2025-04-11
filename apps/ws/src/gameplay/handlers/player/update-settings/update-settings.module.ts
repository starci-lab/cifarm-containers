import { Module } from "@nestjs/common"
import { UpdateSettingsService } from "./update-settings.service"
import { UpdateSettingsGateway } from "./update-settings.gateway"

@Module({
    providers: [UpdateSettingsService, UpdateSettingsGateway]
})
export class UpdateSettingsModule {}

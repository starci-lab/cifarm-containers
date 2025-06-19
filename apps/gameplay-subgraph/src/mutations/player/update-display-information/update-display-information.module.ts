import { Module } from "@nestjs/common"
import { UpdateDisplayInformationService } from "./update-display-information.service"
import { UpdateDisplayInformationResolver } from "./update-display-information.resolver"

@Module({
    providers: [UpdateDisplayInformationService, UpdateDisplayInformationResolver]
})
export class UpdateDisplayInformationModule {}

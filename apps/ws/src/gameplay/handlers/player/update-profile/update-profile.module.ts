import { Module } from "@nestjs/common"
import { UpdateProfileService } from "./update-profile.service"
import { UpdateProfileGateway } from "./update-profile.gateway"

@Module({
    providers: [UpdateProfileService, UpdateProfileGateway]
})
export class UpdateProfileModule {}

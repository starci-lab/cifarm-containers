import { Module } from "@nestjs/common"
import { UpdateFollowXService } from "./update-follow-x.service"
import { UpdateFollowXResolver } from "./update-follow-x.resolver"

@Module({
    providers: [UpdateFollowXService, UpdateFollowXResolver]
})
export class UpdateFollowXModule {}

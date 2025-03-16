import { Module } from "@nestjs/common"
import { FollowResolver } from "./follow.resolver"
import { FollowService } from "./follow.service"

@Module({
    providers: [FollowService, FollowResolver]
})
export class FollowModule {}

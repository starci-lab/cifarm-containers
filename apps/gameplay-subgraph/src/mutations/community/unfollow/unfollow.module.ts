import { Module } from "@nestjs/common"
import { UnfollowResolver } from "./unfollow.resolver"
import { UnfollowService } from "./unfollow.service"

@Module({
    providers: [UnfollowService, UnfollowResolver],
})
export class UnfollowModule {}

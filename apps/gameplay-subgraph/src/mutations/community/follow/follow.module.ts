import { Module } from "@nestjs/common"
import { FollowController } from "./follow.resolver"
import { FollowService } from "./follow.service"

@Module({
    controllers: [FollowController],
    providers: [FollowService]
})
export class FollowModule {}

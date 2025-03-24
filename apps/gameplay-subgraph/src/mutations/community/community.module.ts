import { Module } from "@nestjs/common"
import { FollowModule } from "./follow"
import { UnfollowModule } from "./unfollow"

@Module({
    imports: [
        FollowModule,
        UnfollowModule,
    ]
})
export class CommunityModule {}

import { Module } from "@nestjs/common"
import { FollowModule } from "@apps/gameplay-service/src/community/follow/follow.module"

@Module({
    imports: [FollowModule]
})
export class CommunityModule {}

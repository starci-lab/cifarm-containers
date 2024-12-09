import { Module } from "@nestjs/common"
import { UnfollowController } from "./unfollow.controller"
import { UnfollowService } from "./unfollow.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { FollowRecordEntity } from "@src/database"

@Module({
    imports: [TypeOrmModule.forFeature([FollowRecordEntity])],
    controllers: [UnfollowController],
    providers: [UnfollowService],
    exports: [UnfollowService]
})
export class UnfollowModule {}

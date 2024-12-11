import { Module } from "@nestjs/common"
import { UnfollowController } from "./unfollow.controller"
import { UnfollowService } from "./unfollow.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UsersFollowingUsersEntity } from "@src/database"

@Module({
    imports: [TypeOrmModule.forFeature([UsersFollowingUsersEntity])],
    controllers: [UnfollowController],
    providers: [UnfollowService],
    exports: [UnfollowService]
})
export class UnfollowModule {}

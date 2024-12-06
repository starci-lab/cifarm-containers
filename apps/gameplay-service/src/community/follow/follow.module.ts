import { Module } from "@nestjs/common"
import { FollowController } from "./follow.controller"
import { FollowService } from "./follow.service"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity, FollowRecordEntity } from "@src/database"

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, FollowRecordEntity])],
    controllers: [FollowController],
    providers: [FollowService],
    exports: [FollowService]
})
export class FollowModule {}

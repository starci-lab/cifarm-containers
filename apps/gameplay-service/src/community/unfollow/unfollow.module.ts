import { Module } from "@nestjs/common"
import { UnfollowController } from "./unfollow.controller"
import { UnfollowService } from "./unfollow.service"

@Module({
    imports: [],
    controllers: [UnfollowController],
    providers: [UnfollowService],
    exports: [UnfollowService]
})
export class UnfollowModule {}

import { Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { FollowController } from "./follow.controller"
import { FollowService } from "./follow.service"

@Module({
    imports: [typeOrmForFeature()],
    controllers: [FollowController],
    providers: [FollowService],
    exports: [FollowService]
})
export class FollowModule {}

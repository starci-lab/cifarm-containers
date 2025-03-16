import { Module } from "@nestjs/common"
import { UpdateFollowXService } from "./update-follow-x.service"
import { UpdateFollowXController } from "./update-follow-x.controller"


@Module({
    imports: [],
    providers: [UpdateFollowXService],
    controllers: [UpdateFollowXController]
})
export class UpdateFollowXModule {}

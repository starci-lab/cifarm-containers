import { Module } from "@nestjs/common"
import { BuildThenPushCommand } from "./build-then-push.service"

@Module({
    providers: [BuildThenPushCommand]
})
export class BuildThenPushModule {}
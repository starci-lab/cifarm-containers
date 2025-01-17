import { Module } from "@nestjs/common"
import { BuildThenPushModule } from "./build-then-push"
import { DockerCommand } from "./docker.command"

@Module({
    imports: [BuildThenPushModule],
    providers: [DockerCommand]
})
export class DockerModule {}

import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { DatabaseModule } from "./database"
import { ExecModule } from "@src/exec"
import { DockerModule } from "./docker/docker.module"

@Module({
    imports: [
        EnvModule.forRoot(),
        ExecModule.register({
            docker: {
                core: true
            },
            isGlobal: true
        }),
        DatabaseModule,
        DockerModule
    ]
})
export class AppModule {}
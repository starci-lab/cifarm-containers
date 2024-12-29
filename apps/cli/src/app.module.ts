import { Module } from "@nestjs/common"
import { CommandsModule } from "./commands"
import { EnvModule } from "@src/grpc"

@Module({
    imports: [
        EnvModule.forRoot(),
        CommandsModule
    ]
})
export class AppModule {}
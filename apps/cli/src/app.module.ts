import { Module } from "@nestjs/common"
import { CommandsModule } from "./commands"
import { EnvModule } from "@src/config"

@Module({
    imports: [
        EnvModule.forRoot(),
        CommandsModule
    ]
})
export class AppModule {}
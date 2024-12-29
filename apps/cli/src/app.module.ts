import { Module } from "@nestjs/common"
import { CommandsModule } from "./commands"
import { InitModule } from "./init"
import { EnvModule } from "@src/config"

@Module({
    imports: [
        EnvModule.forRoot(),
        InitModule,
        CommandsModule
    ]
})
export class AppModule {}
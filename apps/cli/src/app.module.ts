import { Module } from "@nestjs/common"
import { CommandsModule } from "./commands"
import { LoggerModule } from "./logger"
import { configForRoot } from "@src/dynamic-modules"
import { InitializeModule } from "./initialize/initialize.module"
import { TypeOrmModule } from "@nestjs/typeorm"

@Module({
    imports: [
        configForRoot(),
        LoggerModule,
        typeOrmF
        InitializeModule,
        CommandsModule
    ]
})
export class AppModule {}
import { Module } from "@nestjs/common"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { EnvModule } from "@src/env"
import { TelegrafModule } from "@src/telegraf"
import { BotModule } from "./bot"
import { ScheduleModule } from "@nestjs/schedule"

@Module({
    imports: [
        EnvModule.forRoot(),
        TelegrafModule.register({
            isGlobal: true
        }),
        EventEmitterModule.forRoot(),
        ScheduleModule.forRoot(),
        BotModule
    ],
})
export class AppModule {}

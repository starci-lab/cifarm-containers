import { Module } from "@nestjs/common"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { envConfig, EnvModule } from "@src/env"
import { KubernetesModule } from "@src/kubernetes"
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
        KubernetesModule.register({
            isGlobal: true,
            leaderElection: {
                leaseName: "telegram-bot-leader-election",
                useMinikubeForDevelopment: envConfig().kubernetes.useMinikubeForDevelopment
            }
        }),
        BotModule
    ],
})
export class AppModule {}

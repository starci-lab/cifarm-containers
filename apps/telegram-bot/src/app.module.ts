import { Module } from "@nestjs/common"
import { EnvModule } from "@src/env"
import { KubernetesModule } from "@src/kubernetes"
import { TelegrafModule } from "@src/telegraf"

@Module({
    imports: [
        EnvModule.forRoot(),
        TelegrafModule.register({
            isGlobal: true
        }),
        KubernetesModule.register({
            isGlobal: true,
            leaderElection: {
                leaseName: "telegram-bot-leader-election",
                useMinikubeForDevelopment: true
            }
        })
    ],
})
export class AppModule {}

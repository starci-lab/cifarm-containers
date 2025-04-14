import { Module } from "@nestjs/common"
import { WebhookModule } from "./webhook"
import { FarcasterModule } from "@src/farcaster"

@Module({
    imports: [
        WebhookModule,
        FarcasterModule.register({
            isGlobal: true,
        }),
    ],
})
export class AppModule {}

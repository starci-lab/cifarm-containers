import { Module } from "@nestjs/common"
import { WebhookController } from "./webhook.controller"
import { WebhookService } from "./webhooks.service"

@Module({
    controllers: [WebhookController],
    providers: [WebhookService],
})
export class WebhookModule {}

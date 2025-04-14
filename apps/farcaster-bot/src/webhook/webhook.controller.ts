import { Logger, Post, Body, Controller } from "@nestjs/common"
import { WebhookService } from "./webhooks.service"
import { WebhookCastCreated } from "@neynar/nodejs-sdk"

@Controller("webhook")
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name)

    constructor(private readonly webhookService: WebhookService) {}

    @Post("/cast-created")
    async castCreated(@Body() body: WebhookCastCreated) {
        await this.webhookService.castCreated(body)
    }
}

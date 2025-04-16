import { Injectable } from "@nestjs/common"
import { Logger } from "@nestjs/common"
import { WebhookCastCreated } from "@neynar/nodejs-sdk"
import { FarcasterService } from "@src/farcaster"

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name)

    constructor(private readonly farcasterService: FarcasterService) {}

    async castCreated(body: WebhookCastCreated) {
        await this.farcasterService.publishCast({
            parent: body.data.hash,
            text: "this is auto generated cast. i am cuong",
        })
    } 
}


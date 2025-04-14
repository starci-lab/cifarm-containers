import { Injectable, Logger } from "@nestjs/common"
import {
    NeynarAPIClient, Configuration, isApiErrorResponse  
} from "@neynar/nodejs-sdk"
import { envConfig } from "@src/env"

@Injectable()
export class FarcasterWebhookService {
    private readonly logger = new Logger(FarcasterWebhookService.name)

    private readonly client : NeynarAPIClient
    constructor() {
        this.client = new NeynarAPIClient(new Configuration({
            apiKey: envConfig().farcaster.apiKey
        }))
    }

    public async publishCast(request: PublishCastRequest) {
        try {
            const response = await this.client.publishCast({
                signerUuid: envConfig().farcaster.signerUuid,
                ...request
            })
            return response
        } catch (error) {
            if (isApiErrorResponse(error)) {
                console.log(error)
                throw new Error(error.message)
            }
            throw error
        }
    }
}

export type PublishCastRequest = Omit<Parameters<NeynarAPIClient["publishCast"]>[0], "signerUuid">

import { ExecutionContext, Injectable } from "@nestjs/common"
import { ThrottlerGuard, ThrottlerRequest } from "@nestjs/throttler"
import { Socket } from "socket.io"
import { WsException } from "@nestjs/websockets"    

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
    protected override async getTracker(client: Socket): Promise<string> {
        return client.conn.remoteAddress
    }

    protected override async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
        const { context, limit, ttl , blockDuration, throttler, generateKey } = requestProps
        const client = context.switchToWs().getClient<Socket>()
        const tracker = client.conn.remoteAddress
        const key = generateKey(context, tracker, throttler.name)
        const { isBlocked } = await this.storageService.increment(
            key,
            ttl,
            limit,
            blockDuration,
            throttler.name
        )
        if (isBlocked) {
            // Throw an error when the user reached their limit.
            await this.throwThrottlingException(context)
        }
        return true
    }

    protected override throwThrottlingException(context: ExecutionContext): Promise<void> {
        const client = context.switchToWs().getClient<Socket>()
        const tracker = client.conn.remoteAddress
        throw new WsException(`Too many requests: ${tracker}`)
    }
}

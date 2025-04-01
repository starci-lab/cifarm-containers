import { ThrottlerGuard } from "@nestjs/throttler"
import { ExecutionContext, Injectable } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import { Request } from "express"
import { GraphQLError } from "graphql"
import { isIPv4, isIPv6 } from "net"
@Injectable()
export class GraphQLThrottlerGuard extends ThrottlerGuard {
    private getIp(req: Request): string {
        return req.ips.length ? req.ips[0] : req.ip
    }
    protected async getTracker(req: Request): Promise<string> {
        return this.getIp(req)
    }

    protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
        const gqlCtx = GqlExecutionContext.create(context)
        const ctx = gqlCtx.getContext()
        const ip = this.getIp(ctx.req)
        if (isIPv4(ip) && ip === "127.0.0.1") {
            return true
        }
        if (isIPv6(ip) && ip === "::1") {
            return true
        }
        return false
    }

    getRequestResponse(context: ExecutionContext) {
        const gqlCtx = GqlExecutionContext.create(context)
        const ctx = gqlCtx.getContext()
        return { req: ctx.req, res: ctx.res }
    }

    protected override throwThrottlingException(context: ExecutionContext): Promise<void> {
        const gqlCtx = GqlExecutionContext.create(context)
        const ctx = gqlCtx.getContext()
        const ip = this.getIp(ctx.req)
        throw new GraphQLError("Too many requests", {
            extensions: {
                code: "TOO_MANY_REQUESTS",
                ip
            }
        })
    }
}
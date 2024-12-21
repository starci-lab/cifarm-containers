import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
})

export const WsUser = createParamDecorator((_, ctx: ExecutionContext) => {
    const data = ctx.switchToWs().getClient().data
    return data.user
})

export const GraphqlUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req.user
})
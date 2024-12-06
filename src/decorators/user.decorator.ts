import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
})

export const WsUser = createParamDecorator((_, ctx: ExecutionContext) => {
    const data = ctx.switchToWs().getClient().data
    return data.user
})
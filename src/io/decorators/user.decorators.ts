import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const WsUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const data = ctx.switchToRpc().getData()
    return data.user
})

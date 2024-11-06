import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const TelegramData = createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.telegramData
})

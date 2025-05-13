import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { UserXLike } from "../types"

export const XUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp().getRequest()
    return ctx.user as UserXLike
})
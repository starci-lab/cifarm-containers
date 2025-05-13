import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { UserFacebookLike } from "../types"

export const FacebookUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp().getRequest()
    return ctx.user as UserFacebookLike
})
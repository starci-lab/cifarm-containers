import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { UserGoogleLike } from "../types"

export const GoogleUser = createParamDecorator((_: unknown, context: ExecutionContext) => {
    const ctx = context.switchToHttp().getRequest()
    return ctx.user as UserGoogleLike
})
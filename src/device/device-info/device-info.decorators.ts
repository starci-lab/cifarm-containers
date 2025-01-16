import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const RequestDeviceInfo = createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.device_info
})
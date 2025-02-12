import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
// import { UserSchema } from "@src/database"
// import { Roles } from "@src/decorators"
// import { NotHavePermissionException } from "@src/exceptions"

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        console.log(context)
        // const roles = this.reflector.get(Roles, context.getHandler())
        // if (!roles) {
        //     return true
        // }
        // const request = context.switchToHttp().getRequest()
        // const user = request.user as UserSchema
        
        // // if user is admin, return true
        // if (user.roles.includes(UserSchema.Admin)) return true

        // const hasPermission = user.roles.some((role) => roles.includes(role))
        // if (!hasPermission) {
        //     throw new NotHavePermissionException(user.roles, roles)
        // }
        return true
    }

}
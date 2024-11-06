import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Reflector } from "@nestjs/core"
// import { UserEntity } from "@src/database"
// import { Roles } from "@src/decorators"
// import { NotHavePermissionException } from "@src/exceptions"

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // const roles = this.reflector.get(Roles, context.getHandler())
        // if (!roles) {
        //     return true
        // }
        // const request = context.switchToHttp().getRequest()
        // const user = request.user as UserEntity
        
        // // if user is admin, return true
        // if (user.roles.includes(UserEntity.Admin)) return true

        // const hasPermission = user.roles.some((role) => roles.includes(role))
        // if (!hasPermission) {
        //     throw new NotHavePermissionException(user.roles, roles)
        // }
        return true
    }

}
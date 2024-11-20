import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { GqlExecutionContext } from "@nestjs/graphql"

@Injectable()
export class GraphqlJwtAuthGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext) {
        const gqlContext = GqlExecutionContext.create(context).getContext()
        return gqlContext.req
    }
}

@Injectable()
export class RestJwtAuthGuard extends AuthGuard("jwt") {
    handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest()
        console.log("Authorization Header:", request.headers.authorization)
        console.log("Error:", err)
        console.log("Info:", info)

        if (info?.message === "No auth token") {
            throw new UnauthorizedException("Authorization header is missing")
        }

        if (err || !user) {
            throw err || new UnauthorizedException()
        }
        return user
    }
}

import { Injectable, ExecutionContext } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"
import { AuthGuard } from "@nestjs/passport"

@Injectable()
export class GraphQLJwtAuthGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext) {
        const gqlContext = GqlExecutionContext.create(context).getContext()
        return gqlContext.req
    }
}

import { Injectable, ExecutionContext } from "@nestjs/common"
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
}
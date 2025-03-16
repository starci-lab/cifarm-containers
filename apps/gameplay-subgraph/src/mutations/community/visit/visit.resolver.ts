import { Logger, UseGuards } from "@nestjs/common"
import { VisitRequest, VisitResponse } from "./visit.dto"
import { VisitService } from "./visit.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard } from "@src/jwt"

@Resolver()
export class VisitResolver {
    private readonly logger = new Logger(VisitResolver.name)

    constructor(private readonly visitService: VisitService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VisitResponse, { name: "visit" })
    public async visit(
        @GraphQLUser() user: UserLike,
        @Args("request") request: VisitRequest
    ) {
        return this.visitService.visit(user, request)
    }
}

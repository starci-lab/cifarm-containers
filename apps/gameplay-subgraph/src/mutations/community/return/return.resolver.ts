import { Logger, UseGuards } from "@nestjs/common"
import { ReturnService } from "./return.service"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class ReturnResolver {
    private readonly logger = new Logger(ReturnResolver.name)

    constructor(private readonly returnService: ReturnService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, {
        name: "return",
        description: "Return a placed item",
        nullable: true
    })
    public async return(@GraphQLUser() user: UserLike) {
        return this.returnService.return(user)
    }
}

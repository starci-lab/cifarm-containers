import { Logger, UseGuards } from "@nestjs/common"
import { ReturnService } from "./return.service"
import { Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"

@Resolver()
export class ReturnResolver {
    private readonly logger = new Logger(ReturnResolver.name)

    constructor(private readonly returnService: ReturnService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "return" })
    public async return(
        @GraphQLUser() user: UserLike,
    ) {
        return this.returnService.return(user)
    }
}

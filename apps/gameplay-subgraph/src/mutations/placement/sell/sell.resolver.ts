import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { EmptyObjectType } from "@src/common"
import { SellRequest } from "./sell.dto"
import { SellService } from "./sell.service"

@Resolver()
export class SellResolver {
    private readonly logger = new Logger(SellResolver.name)
    constructor(
            private readonly placementService: SellService
    ){}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "sell" })
    public async sell(@GraphQLUser() user: UserLike, @Args("request") request: SellRequest) {
        return await this.placementService.sell(user, request)
    }
    
}

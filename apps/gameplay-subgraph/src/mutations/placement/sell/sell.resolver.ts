import { Logger, UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { SellRequest } from "./sell.dto"
import { SellService } from "./sell.service"
import { VoidResolver } from "graphql-scalars"

@Resolver()
export class SellResolver {
    private readonly logger = new Logger(SellResolver.name)
    constructor(
            private readonly placementService: SellService
    ){}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => VoidResolver, { name: "sell", description: "Sell a placed item", nullable: true })
    public async sell(@GraphQLUser() user: UserLike, @Args("request") request: SellRequest) {
        return await this.placementService.sell(user, request)
    }
    
}

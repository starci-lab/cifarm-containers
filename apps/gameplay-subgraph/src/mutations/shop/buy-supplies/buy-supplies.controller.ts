import { Logger, UseGuards } from "@nestjs/common"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { BuySuppliesService } from "./buy-supplies.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class BuySuppliesResolver {
    private readonly logger = new Logger(BuySuppliesResolver.name)

    constructor(private readonly buySupplyService: BuySuppliesService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "buySupplies" })
    public async buySupplies(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuySuppliesRequest
    ): Promise<EmptyObjectType> {
        return this.buySupplyService.buySupplies(user, request)
    }
}

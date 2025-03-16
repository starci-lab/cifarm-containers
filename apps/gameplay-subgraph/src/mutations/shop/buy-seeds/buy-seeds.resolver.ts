import { Logger, UseGuards } from "@nestjs/common"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { BuySeedsService } from "./buy-seeds.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { EmptyObjectType } from "@src/common"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class BuySeedsResolver {
    private readonly logger = new Logger(BuySeedsResolver.name)

    constructor(private readonly buySeedService: BuySeedsService) {}
    
    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "buySeeds" })
    public async buySeeds(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuySeedsRequest
    ): Promise<EmptyObjectType> {
        return this.buySeedService.buySeeds(user, request)
    }
}

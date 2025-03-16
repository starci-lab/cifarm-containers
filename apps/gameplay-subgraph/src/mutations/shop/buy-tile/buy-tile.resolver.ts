import { Logger, UseGuards } from "@nestjs/common"
import { BuyTileService } from "./buy-tile.service"
import { BuyTileRequest } from "./buy-tile.dto"
import { GraphQLJwtAuthGuard } from "@src/jwt"
import { EmptyObjectType } from "@src/common"
import { GraphQLUser } from "@src/decorators"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { UserLike } from "@src/jwt"     

@Resolver()
export class BuyTileResolver {
    private readonly logger = new Logger(BuyTileResolver.name)

    constructor(private readonly buyTileService: BuyTileService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Mutation(() => EmptyObjectType, { name: "buyTile" })
    public async buyTile(
        @GraphQLUser() user: UserLike,
        @Args("request") request: BuyTileRequest
    ): Promise<EmptyObjectType> {
        return await this.buyTileService.buyTile(user, request)
    }
}
